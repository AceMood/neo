/**
 * @file HTML资源类
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

/**
 * html files
 * @extends {Resource}
 * @constructor
 * @param {string} path 资源路径
 */
function HTML(path) {
  Resource.call(this, path);

  this.id = null;

  this._requiredCSSMap = {};
  this._requiredJSMap = {};
  this._requiredImageMap = {};
  this._requiredHTMLMap = {};
  this._requiredTextToResolvedID = {};
}

inherits(HTML, Resource);

// 默认属性移到prototype, 减少序列化后的对象属性
HTML.prototype.networkSize = 0;
HTML.prototype.type = 'HTML';

/**
 * 初始化时, 这些属性保留的是`require()`调用的字符串参数. 通常这个不是所需要的moduleIDs,
 * 而是一个相对路径. 在后处理`postProcess`之后, 这里面的每一项如果和最初的调用参数不同,
 * 都会被相对的resource IDs代替.
 * 属性`_requiredTextToResolvedID` 记录了源码中的文本和对应的moduleID之间的对应关系.
 * 相应的ID最终会被保存在`requiredModules` 数组中, 你可以利用打包工具查找这个对应关系, 然后
 * 替换掉require的参数.
 */
HTML.prototype.requiredJS = [];
HTML.prototype.requiredCSS = [];
HTML.prototype.requiredImage = [];
HTML.prototype.requiredHTML = [];

HTML.prototype.addRequiredJS = function(x) {
  this._requiredJSMap[x] = true;
};

HTML.prototype.addRequiredImage = function(x) {
  this._requiredImageMap[x] = true;
};

HTML.prototype.addRequiredHTML = function(x) {
  this._requiredHTMLMap[x] = true;
};

HTML.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

/**
 * 标准依赖模块
 */
HTML.prototype.finalize = function() {
  var keys = Object.keys(this._requiredJSMap);
  if (keys.length) {
    this.requiredJS = keys;
  }
  keys = Object.keys(this._requiredImageMap);
  if (keys.length) {
    this.requiredImage = keys;
  }
  keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
  }
  keys = Object.keys(this._requiredHTMLMap);
  if (keys.length) {
    this.requiredHTML = keys;
  }
};

/**
 * `_requiredModuleMap` records the original form that the module was required
 * in, before `postProcess` has normalized it to the canonical ID form.
 * `_requiredTextToResolvedID` associates the two. So if your HTML has
 * `require('./path/comp.js')`, then the HTML resource instance will have:
 *
 *   _requiredModuleMap: {'./path/comp.js': true}
 *   requiredModules: ['package-name/path/comp.js']
 *   _requiredTextToResolvedID: {'./path/comp.js': 'package-name/path/comp.js'}
 *
 * @param {string} origName require调用时的原始字符串.
 * @param {string} modID Canonical module ID origName resolves to from the
 * perspective of this particular resource.
 */
HTML.prototype.recordRequiredModuleOrigin = function(origName, modID) {
  this._requiredTextToResolvedID[origName] = modID;
};

/**
 * @param {String} origName Originally required name as in `require('./x/y.js')`
 * @return {String} canonical module ID - which might have been redirected using
 * `recordRequiredModuleOrigin` or not.
 */
HTML.prototype.getModuleIDByOrigin = function(origName) {
  return this._requiredTextToResolvedID[origName] || origName;
};

/**
 * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了_开头的属性
 * @static
 * @param  {object} object
 * @return {Resource}
 */
HTML.fromObject = function(object) {
  var instance = new HTML(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};

// 导出
module.exports = HTML;