/**
 * @file SWF资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var Resource = require('./Resource');
var util = require('../util');

/**
 * @extends {Resource}
 * @constuctor
 * @param {string} path 资源路径
 */
function SWF(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(SWF, Resource);

SWF.prototype.type = 'SWF';
SWF.prototype.encoding = 'binary';

/**
 * 获取文件内容
 * @return {string|Buffer}
 */
SWF.prototype.getContent = function() {
  if (this._fileContent) {
    return this._fileContent;
  }
  var buf;
  try {
    buf = fs.readFileSync(this.path);
  } catch (e) {
    // todo warning
  }

  this._fileContent = buf.toString(this.encoding);
  return this._fileContent;
};

/**
 * 设置文件内容
 * @param {string|Buffer} content
 */
SWF.prototype.setContent = function(content) {
  if (Buffer.isBuffer(content)) {
    this._fileContent = content.toString(this.encoding);
  } else {
    this._fileContent = content || '';
  }
};

/**
 * 将资源内容写入到指定位置
 * @param {string} distPath
 * @param {function} callback
 */
SWF.prototype.flush = function(distPath, callback) {
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
};

/**
 * @static
 * @param {Object} obj
 * @returns {SWF}
 */
SWF.fromObject = function(obj) {
  var swf = new SWF(obj.path);
  swf.path = obj.path;
  swf.mtime = obj.mtime;
  return swf;
};

/**
 * 资源转化成对象
 * @returns {Object}
 */
SWF.prototype.toObject = function() {
  return {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };
};

// 导出
module.exports = SWF;