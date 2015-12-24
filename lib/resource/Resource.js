/**
 * @file 单个静态资源基类
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var fs = require('fs');

/**
 * 所有类型资源的基类. 一个资源对象掌握着特定类型资源信息.
 * See properties.
 * @constructor
 * @param {String} path 资源路径
 */
function Resource(path) {
  this.path = node_path.normalize(path);
  // override id
  this.id = node_path.normalize(path);
}

// mtime
Resource.prototype.mtime = 0;
// 预设类型
Resource.prototype.type = 'Resource';

/**
 * 资源序列化成对象
 * @return {object}
 */
Resource.prototype.toObject = function() {
  var object = {
    type: this.type
  };

  for (var i in this) {
    if (i.charAt(0) !== '_' && this.hasOwnProperty(i)) {
      object[i] = this[i];
    }
  }

  return object;
};

/**
 * 设置文件内容
 * @param {string} content
 */
Resource.prototype.setContent = function(content) {
  this._fileContent = content || '';
};

/**
 * 获取文件内容
 * @return {?String}
 */
Resource.prototype.getContent = function() {
  if (this._fileContent) {
    return this._fileContent;
  }
  var buf;
  try {
    buf = fs.readFileSync(this.path);
  } catch (e) {
    // todo
    buf = null;
    process.exit();
  }
  this._fileContent = buf.toString();
  return this._fileContent;
};

// 导出
module.exports = Resource;