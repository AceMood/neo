/**
 * @fileoverview 单个静态资源基类
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');

/**
 * 所有类型资源的基类。一个资源对象掌握着特定类型资源信息。
 * See properties.
 * @abstract
 * @constructor
 * @param {String} path 资源路径
 */
function Resource(path) {
  this.path = node_path.normalize(path);
  this.id = node_path.normalize(path);
}

Resource.prototype.mtime = 0;
// 预设类型
Resource.prototype.type = 'Resource';

/**
 * 资源序列化成对象
 * @return {Object}
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
 * 由对象生成资源实例
 * @static
 * @param  {Object} object
 * @return {Resource}
 */
Resource.fromObject = function(object) {
  var Type = this;
  var instance = new Type(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};

// 导出
module.exports = Resource;