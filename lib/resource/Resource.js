/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file 静态资源基类
 * @author AceMood
 * @email zmike86@gmail.com
 */

/* globals slogger */

'use strict';

var node_path = require('path');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var util = require('../util');

class Resource extends EventEmitter {
  /**
   * 所有类型资源的基类. 一个资源对象掌握着特定类型资源信息.
   * See properties.
   * @param {string} path 资源路径
   */
  constructor(path) {
    super();

    this.path = node_path.normalize(path);
    this.id = node_path.normalize(path);
  }

  /**
   * 将资源序列化成对象
   * @returns {!object}
   */
  toObject() {
    var object = {
      type: this.type
    };

    // 过滤掉`_`开头的私有属性
    for (var i in this) {
      if (i !== '_fileContent' && this.hasOwnProperty(i)) {
        object[i] = this[i];
      }
    }

    return object;
  }

  /**
   * 设置文件内容
   * @param {string|Buffer} content
   */
  setContent(content) {
    if (Buffer.isBuffer(content)) {
      this._fileContent = content.toString(this.encoding);
    } else {
      this._fileContent = content || '';
    }
  }

  /**
   * 获取文件内容
   * @param  {string=} encoding
   * @return {string}
   */
  getContent(encoding) {
    encoding = encoding || this.encoding;
    var path = this.path;

    if (!Buffer.isEncoding(encoding)) {
      slogger.error(
        encoding,
        ' is not valid encoding for Buffer Object in',
        this.path
      );
      return '';
    }

    /**
     * 对文件缓冲
     * @returns {*}
     */
    function read() {
      var buf;
      try {
        buf = fs.readFileSync(path);
      } catch (err) {
        slogger.error('can\'t read file at ' + path);
        throw err;
      }

      return buf;
    }

    if (encoding === this.encoding) {
      if (!this._fileContent) {
        let buf = read();
        this._fileContent = buf.toString(this.encoding);
      }

      return this._fileContent;

    } else {
      let buf;
      if (this._fileContent) {
        // 转成需要的编码
        buf = new Buffer(this._fileContent, this.encoding);
      } else {
        buf = read();
        this._fileContent = buf.toString(this.encoding);
      }

      return buf.toString(encoding);
    }
  }

  /**
   * 将资源内容写入到指定位置
   * @param {string} distPath
   * @param {function} callback
   */
  flush(distPath, callback) {
    var dir = node_path.parse(distPath).dir;
    if (dir) {
      util.mkdirp(dir);
    }

    var mode = 511 & (~process.umask());
    fs.writeFile(distPath, this.getContent(), {
      encoding: this.encoding,
      mode: mode
    }, function(err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  }

  /**
   * 当前资源内容的编码
   */
  getContentEncoding() {
    return this.encoding;
  }

  /**
   * 当前资源内容的编码
   * @param {!string} encoding
   */
  setContentEncoding(encoding) {
    this.encoding = encoding;
  }

  /**
   * 将编译的工作从构建工具流中移出来，由每个资源自己做。
   * 插件通过监听资源编译中的事件完成功能扩展。目前还不支持async-event-listener.
   * 编译过程会将资源添加一个isCompiled属性。这个属性会影响到内存缓存策略，
   * 优先考虑支持文件读取的缓存，文件编译的缓存，后续再做打算
   * @param {!ResourceMap} map 资源表对象，方便递归编译时查表
   * @param {!object} rule 匹配规则对象，正常情况下会含有pattern和to两个规则属性
   * @returns {Resource}
   */
  compile(map, rule) {
    if (this.isCompiled) {
      return this;
    }

    this.emit('pre-compile-resource', this);

    this.emit('compiled-resource', this);

    this.isCompiled = true;

    this.emit('pre-resolve-resource', this);

    this.resolveOnlineUri(rule.pattern, rule.to);

    this.emit('resolved-resource', this);

    return this;
  }

  /**
   * @param {!RegExp} pattern 匹配规则对象
   * @param {!string} to 配置中写的线上路径
   */
  resolveOnlineUri(pattern, to) {
    if (pattern && to) {
      let pathObj = node_path.parse(to);
      if (!pathObj.ext) {
        to = (util.isDirPath(to) ? to : to + '/')
          + node_path.basename(this.path);
      }

      this.uri = this.path.replace(pattern, to);
    } else {
      this.uri = this.path;
    }
  }
}

Resource.prototype.encoding = 'utf8';
Resource.prototype.mtime = 0;
Resource.prototype.type = 'Resource';

module.exports = Resource;