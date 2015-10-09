/**
 * @fileoverview 样式表资源类
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var util = require('util');
var utils = require('../utils');
var ResourceBase = require('./ResourceBase');

/**
 * 单个样式表文件资源.
 * @constructor
 */
function CSS (config) {
  ResourceBase.call(this, config);

  this.sprites = [];
  this.options = {};
  this._requiredCSSMap = {};
  this._requiredLegacyComponentsMap = [];

  this.getHashId();
}

util.inherits(CSS, ResourceBase);

/**
 * 返回当前资源的hash值
 * @return {String}
 */
CSS.prototype.getHashId = function () {
  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.sid = utils.getStringHash(this.from, 5).base64;
  this.cachedContent = ret.content;
  // 事先无法知道to的具体值，在这里更新
  this.to = utils.normalizeSysPath(
      path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));

  // 不存储缓存内容 todo
  delete this.cachedContent;
};

CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;
CSS.prototype.isModule = false;
CSS.prototype.isPermanent = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'css';
CSS.prototype.requiredCSS = [];
CSS.prototype.requiredLegacyComponents = [];

CSS.prototype.addRequiredLegacyComponent = function(x) {
  this._requiredLegacyComponentsMap[x] = true;
};

CSS.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

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