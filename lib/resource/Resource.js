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

    if (!Buffer.isEncoding(encoding)) {
      slogger.warn(
        encoding,
        ' is not valid encoding for Buffer Object in',
        this.path);
      return '';
    }

    var buf;
    if (this._fileContent) {
      if (encoding === this.encoding) {
        return this._fileContent;
      } else {
        // 转成需要的编码
        buf = new Buffer(this._fileContent, this.encoding);
        return buf.toString(encoding);
      }
    }

    try {
      buf = fs.readFileSync(this.path);
    } catch (err) {
      slogger.error('On reading file at ' + this.path);
      throw err;
    }

    this._fileContent = buf.toString(this.encoding);
    return (this.encoding === encoding ?
      this._fileContent : buf.toString(encoding));
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
   * @param   {ResourceMap} map
   * @param   {RuleMap} rules
   * @returns {Resource}
   */
  compile(map, rules) {
    this.emit('pre-compile-resource', this);

    this.emit('compiled-resource', this);

    this.compiled = true;

    this.emit('pre-resolve-resource', this);

    this.resolveOnlineUri(rules);

    this.emit('resolved-resource', this);

    return this;
  }

  /**
   * @param {RuleMap} rules
   */
  resolveOnlineUri(rules) {
    var hit = rules.match(this.path);
    if (hit) {
      let pattern = hit;
      let to = rules.get(pattern).to;

      if (typeof to !== 'string') {
        slogger.error('rule\'s to must be string.');
        throw new Error('the path ' + to +' must be string');
      }

      let pathObj = node_path.parse(to);
      if (!pathObj.ext) {
        to = (util.isDirPath(to) ? to : to + node_path.sep)
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