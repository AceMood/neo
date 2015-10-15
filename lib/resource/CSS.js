/**
 * @fileoverview CSS资源类
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

/**
 * *.css文件的资源
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源的路径
 */
function CSS(path) {
  Resource.call(this, path);

  this.id = null;
  // 保存雪碧图
  this.fbSprites = [];
  this.options = {};
  this._requiredCSSMap = {};
  this._requiredLegacyComponentsMap = [];
}

inherits(CSS, Resource);
CSS.__proto__ = Resource;


CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;
CSS.prototype.isModule = false;
CSS.prototype.isPermanent = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'CSS';
CSS.prototype.requiredCSS = [];
CSS.prototype.requiredLegacyComponents = [];


CSS.prototype.addRequiredLegacyComponent = function(x) {
  this._requiredLegacyComponentsMap[x] = true;
};

/**
 * 添加css依赖模块
 * @param {String} x
 */
CSS.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

/**
 *
 */
CSS.prototype.finalize = function() {
  var keys = Object.keys(this._requiredLegacyComponentsMap);
  if (keys.length) {
    this.requiredLegacyComponents = keys;
  }
  keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
  }
};

// 导出
module.exports = CSS;