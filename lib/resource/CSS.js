/**
 * @file CSS资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;

var Resource = require('./Resource');
var util = require('../util');

var proto = {
  // 是否不合并此模块代码
  isNopackage: false,
  networkSize: 0,
  type: 'CSS',
  requiredCSS: [],
  // 保存雪碧图
  sprites: [],
  addRequiredCSS: function(x) {
    this._requiredCSSMap[x] = true;
  },
  /**
   * 添加css依赖模块
   * @param {String} x
   */
  addSprite: function(x) {
    this._spriteMap[x] = true;
  },
  finalize: function() {
    var keys = Object.keys(this._requiredCSSMap);
    if (keys.length) {
      this.requiredCSS = keys;
    }
    keys = Object.keys(this._spriteMap);
    if (keys.length) {
      this.sprites = keys;
    }
  },
  /**
   * `_requiredModuleMap`记录了源码中require的文字, 在updateTask的后处理之前
   * 已经规范成模块Id. `_requiredTextToResolvedID`保存了原文本和I之间的联系.
   * 如果JS源码是`require('./path/comp.js')`, 则JS资源实例将会有以下属性:
   *
   *   _requiredModuleMap: {'./path/comp.js': true}
   *   requiredModules: ['package-name/path/comp.js']
   *   _requiredTextToResolvedID: {'./path/comp.js': 'package-name/path/comp.js'}
   *
   * @param {string} origName require调用时的原始字符串.
   * @param {string} modID Canonical module ID origName resolves to from the
   * perspective of this particular resource.
   */
  recordRequiredModuleOrigin: function(origName, modID) {
    this._requiredTextToResolvedID[origName] = modID;
  },
  /**
   * @param {string} origName `require('./x/y.js')`调用的原始文本
   * @return {string} canonical module ID.
   */
  getModuleIDByOrigin: function(origName) {
    return this._requiredTextToResolvedID[origName] || origName;
  }
};

/**
 * @extends {Resource}
 * @constructor
 * @param {string} path 资源的路径
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

Object.keys(proto).forEach(function(prop) {
  CSS.prototype[prop] = proto[prop];
});

/**
 * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了`_`开头的私有属性
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