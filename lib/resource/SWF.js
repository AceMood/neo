/**
 * @fileoverview SWF资源 todo 初始化重新覆盖path？
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
function Swf(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(Swf, Resource);
Swf.__proto__ = Resource;

Swf.prototype.type = 'Swf';
Swf.prototype.version = '0.1';

/**
 * @static
 * @param {Object} obj
 * @returns {Swf}
 */
Swf.fromObject = function(obj) {
  var swf = new Swf(obj.path);
  swf.path = obj.path;
  swf.mtime = obj.mtime;
  return swf;
};

/**
 * 资源转化成对象
 * @returns {Object}
 */
Swf.prototype.toObject = function() {
  var obj = {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };

  return obj;
};

// 导出
module.exports = Swf;