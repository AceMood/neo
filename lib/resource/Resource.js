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
 * Resource is a value object that holds the information about a particular
 * resource. See properties.
 *
 * @abstract
 * @constructor
 * @param {String} path 资源路径
 */
function Resource (path) {
  this.path = node_path.normalize(path);
  this.id = node_path.normalize(path);
}

Resource.prototype.mtime = 0;
Resource.prototype.type = 'Resource';

/**
 * Converts Resource to serializable object
 * @return {Object}
 */
Resource.prototype.toObject = function () {
  var object = { type: this.type };
  for (var i in this) {
    if (i.charAt(0) != '_' && this.hasOwnProperty(i)) {
      object[i] = this[i];
    }
  }
  return object;
};

/**
 * Creates a new resource from object
 * @static
 * @param  {Object} object
 * @return {Resource}
 */
Resource.fromObject = function (object) {
  var type = this;
  var instance = new type(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};


module.exports = Resource;