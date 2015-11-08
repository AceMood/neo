/**
 * @file JS资源类
 */

'use strict';

var inherits = require('util').inherits;

var Resource = require('./Resource');

/**
 * Resource for *.js files
 * A heavier version of JS that does extract more information (gziped size).
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源路径
 */
function JS(path) {
  Resource.call(this, path);

  this.id = null;

  this.options = {};
  this._requiredCSSMap = {};
  this._requiredModuleMap = {};
  this._requiredTextToResolvedID = {};
  //this._file = new File(path);
}

inherits(JS, Resource);
JS.__proto__ = Resource;

// move default options to the prototype, to reduce serialized size
JS.prototype.networkSize = 0;
JS.prototype.isModule = false;
JS.prototype.isRunWhenReady = false;
JS.prototype.isLegacy = false;
JS.prototype.isNopackage = false;

// do not modify this arrays in loader, only override
JS.prototype.definedJavelinSymbols = [];
JS.prototype.requiredJavelinSymbols = [];
JS.prototype.requiredDynamicModules = [];
JS.prototype.requiredLazyModules = [];
JS.prototype.requiredCSS = [];

/**
 * 初始化时, 这些属性保留的是`require()`调用的字符串参数. 通常这个不是所需要的moduleIDs,
 * 而是一个相对路径. After `postProcess`, each item in the array is replaced with the
 * actual resource IDs that the `require()` call resolved to - if it differs
 * from the original text argument. The `_requiredTextToResolvedID` records
 * which required "text" was resolved to which ID in the final `requiredModules`
 * array, so that you can packaging tools are free to use that "history" of the
 * the resolution to statically replace the argument to require().
 */
JS.prototype.requiredModules = [];
JS.prototype.requiredLegacyComponents = [];
JS.prototype.suggests = [];
JS.prototype.polyfillUAs = [];

JS.prototype.type = 'JS';

JS.prototype.addRequiredModule = function(x) {
  this._requiredModuleMap[x] = true;
};

JS.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

/**
 * 标准依赖模块
 */
JS.prototype.finalize = function() {
  var keys = Object.keys(this._requiredModuleMap);
  if (keys.length) {
    this.requiredModules = keys;
  }
  keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
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
 * @param {string} origName String passsed to require() in js file.
 * @param {string} modID Canonical module ID origName resolves to from the
 * perspective of this particular resource.
 */
JS.prototype.recordRequiredModuleOrigin = function(origName, modID) {
  this._requiredTextToResolvedID[origName] = modID;
};

/**
 * @param {String} origName Originally required name as in `require('./x/y.js')`
 * @return {String} canonical module ID - which might have been redirected using
 * `recordRequiredModuleOrigin` or not.
 */
JS.prototype.getModuleIDByOrigin = function(origName) {
  return this._requiredTextToResolvedID[origName] || origName;
};

// 导出
module.exports = JS;