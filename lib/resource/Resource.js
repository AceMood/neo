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
var fs = require('fs');
var util = require('../util');

class Resource {
  /**
   * 所有类型资源的基类. 一个资源对象掌握着特定类型资源信息.
   * See properties.
   * @param {string} path 资源路径
   */
  constructor(path) {
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
}

Resource.prototype.encoding = 'utf8';
Resource.prototype.mtime = 0;
Resource.prototype.type = 'Resource';

module.exports = Resource;