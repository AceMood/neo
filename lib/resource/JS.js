/**
 * @file JS资源类
 */

'use strict';

var inherits = require('util').inherits;

var Resource = require('./Resource');

/**
 * 资源 *.js files
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源路径
 */
function JS(path) {
  Resource.call(this, path);

  this.id = null;

  this._requiredCSSMap = {};
  this._requiredModuleMap = {};
  this._requiredAsyncModuleMap = {};
  this._requiredTextToResolvedID = {};
}

inherits(JS, Resource);

// 默认属性移到prototype, 减少序列化后的对象属性
JS.prototype.networkSize = 0;
JS.prototype.isModule = false;
JS.prototype.isRunWhenReady = false;
JS.prototype.isNopackage = false;
JS.prototype.isNonblocking = false;

// do not modify this arrays in loader, only override
JS.prototype.requiredCSS = [];
JS.prototype.type = 'JS';

/**
 * 初始化时, 这些属性保留的是`require()`调用的字符串参数. 通常这个不是所需要的moduleIDs,
 * 而是一个相对路径. 在后处理`postProcess`之后, 这里面的每一项如果和最初的调用参数不同,
 * 都会被相对的resource IDs代替.
 * 属性`_requiredTextToResolvedID` 记录了源码中的文本和对应的moduleID之间的对应关系.
 * 相应的ID最终会被保存在`requiredModules` 数组中, 你可以利用打包工具查找这个对应关系, 然后
 * 替换掉require的参数.
 */
JS.prototype.requiredModules = [];
JS.prototype.requiredAsyncModules = [];

JS.prototype.addRequiredModule = function(x) {
  this._requiredModuleMap[x] = true;
};

JS.prototype.addRequiredAsyncModule = function(x) {
  this._requiredAsyncModuleMap[x] = true;
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
  keys = Object.keys(this._requiredAsyncModuleMap);
  if (keys.length) {
    this.requiredAsyncModules = keys;
  }
  keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
  }
};

/**
 * 给当前资源瘦身, 生成最小资源对象
 */
JS.prototype.shimToObject = function() {
  return {
    id: this.id,
    uri: this.uri,
    deps: this.requiredCSS.concat(this.requiredModules),
    type: this.type
  };
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

/**
 * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了_开头的属性
 * @static
 * @param  {Object} object
 * @return {Resource}
 */
JS.fromObject = function(object) {
  var instance = new JS(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};

// 导出
module.exports = JS;