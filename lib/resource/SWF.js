/**
 * @file SWF资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

/**
 * *.swf files
 * @extends {Resource}
 * @constuctor
 * @param {String} path 资源路径
 */
function SWF(path) {
  Resource.call(this, path);
  this.id = null;
}
inherits(SWF, Resource);

SWF.prototype.type = 'SWF';

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
  // 这里返回原始buffer
  this._fileContent = buf;
  return this._fileContent;
};

/**
 * 设置文件内容
 * @param {string|Buffer} content
 */
SWF.prototype.setContent = function(content) {
  // 确保this._fileContent是Buffer实例
  if (content instanceof Buffer) {
    this._fileContent = content;
  } else {
    this._fileContent = new Buffer(content || '');
  }
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