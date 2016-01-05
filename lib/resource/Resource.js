/**
 * @file 静态资源基类
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var node_path = require('path');
var fs = require('fs');
var util = require('../util');

var logger = require('engineering-util-colorfulconsole');

var proto = {
  constructor: Resource,
  mtime: 0,
  type: 'Resource',
  encoding: 'utf8',
  toObject: function() {
    var object = {
      type: this.type
    };

    // 过滤掉`_`开头的私有属性
    for (var i in this) {
      if (i.charAt(0) !== '_' && this.hasOwnProperty(i)) {
        object[i] = this[i];
      }
    }

    return object;
  },
  /**
   * 设置文件内容
   * @param {string|Buffer} content
   */
  setContent: function(content) {
    if (Buffer.isBuffer(content)) {
      this._fileContent = content.toString(this.encoding);
    } else {
      this._fileContent = content || '';
    }
  },
  /**
   * 获取文件内容
   * @param  {string=} encoding
   * @return {string}
   */
  getContent: function(encoding) {
    encoding = encoding || this.encoding;

    if (!Buffer.isEncoding(encoding)) {
      logger.warn(encoding + ' is not valid encoding for Buffer Object');
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
    } catch (e) {
      logger.error('[Error] on reading file at ' + this.path)
    }

    this._fileContent = buf.toString(this.encoding);
    return (this.encoding === encoding ?
        this._fileContent : buf.toString(encoding));
  },
  /**
   * 将资源内容写入到指定位置
   * @param {string} distPath
   * @param {function} callback
   */
  flush: function(distPath, callback) {
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
  },
  setContentEncoding: function() {
    return this.encoding;
  },
  /**
   * 设置当前资源内容的编码
   * @param {!string} encoding
   */
  getContentEncoding: function(encoding) {
    this.encoding = encoding;
  }
};

/**
 * 所有类型资源的基类. 一个资源对象掌握着特定类型资源信息.
 * See properties.
 * @constructor
 * @param {string} path 资源路径
 */
function Resource(path) {
  this.path = node_path.normalize(path);
  // override id
  this.id = node_path.normalize(path);
}

Resource.prototype = proto;

// 导出
module.exports = Resource;