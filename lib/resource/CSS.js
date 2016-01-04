/**
 * @file CSS资源类
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

/**
 * css文件的资源
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源的路径
 */
function CSS(path) {
  Resource.call(this, path);

  // id重置为空
  this.id = null;

  this._requiredCSSMap = {};
  this._spriteMap = {};
  this._requiredTextToResolvedID = {};
}
inherits(CSS, Resource);

// 不进行打包
CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'CSS';

// 依赖模块
CSS.prototype.requiredCSS = [];
// 保存雪碧图
CSS.prototype.sprites = [];

/**
 * 添加css依赖模块
 * @param {String} x
 */
CSS.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

/**
 * 添加css依赖模块
 * @param {String} x
 */
CSS.prototype.addSprite = function(x) {
  this._spriteMap[x] = true;
};

/**
 * 确定本模块的依赖项
 */
CSS.prototype.finalize = function() {
  var keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
  }
  keys = Object.keys(this._spriteMap);
  if (keys.length) {
    this.sprites = keys;
  }
};

/**
 * `_requiredModuleMap` records the original form that the module was required
 * in, before `postProcess` has normalized it to the canonical ID form.
 * `_requiredTextToResolvedID` associates the two. So if your JS has
 * `require('./path/comp.js')`, then the JS resource instance will have:
 *
 *   _requiredModuleMap: {'./path/comp.js': true}
 *   requiredModules: ['package-name/path/comp.js']
 *   _requiredTextToResolvedID: {'./path/comp.js': 'package-name/path/comp.js'}
 *
 * @param {string} origName require调用时的原始字符串.
 * @param {string} modID Canonical module ID origName resolves to from the
 * perspective of this particular resource.
 */
CSS.prototype.recordRequiredModuleOrigin = function(origName, modID) {
  this._requiredTextToResolvedID[origName] = modID;
};

/**
 * @param  {string} origName Originally required name as in `require('./x/y.js')`
 * @return {string} canonical module ID - which might have been redirected using
 * `recordRequiredModuleOrigin` or not.
 */
CSS.prototype.getModuleIDByOrigin = function(origName) {
  return this._requiredTextToResolvedID[origName] || origName;
};

/**
 * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了_开头的属性
 * @static
 * @param  {object} object
 * @return {Resource}
 */
CSS.fromObject = function(object) {
  var instance = new CSS(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};

// 导出
module.exports = CSS;