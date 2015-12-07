/**
 * @file TPL资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

/**
 * tpl files
 * @extends {Resource}
 * @constuctor
 * @param {String} path 资源路径
 */
function TPL(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(TPL, Resource);

TPL.prototype.type = 'TPL';
TPL.prototype.isPage = true;

/**
 * @static
 * @param {Object} obj
 * @returns {TPL}
 */
TPL.fromObject = function(obj) {
  var tpl = new TPL(obj.path);
  tpl.path = obj.path;
  tpl.mtime = obj.mtime;
  return tpl;
};

/**
 * 资源转化成对象
 * @returns {Object}
 */
TPL.prototype.toObject = function() {
  return {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };
};

// 导出
module.exports = TPL;