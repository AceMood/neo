/**
 * @file CSS资源类
 */

'use strict';

var inherits = require('util').inherits;

var Resource = require('./Resource');
var File = require('../File');

/**
 * *.css文件的资源
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源的路径
 */
function CSS(path) {
  Resource.call(this, path);

  // id重置为空
  this.id = null;

  // 保存雪碧图
  this.sprites = [];
  this.options = {};
  this._requiredCSSMap = {};
  this._file = new File(path);
}

inherits(CSS, Resource);
CSS.__proto__ = Resource;

// 不进行打包
CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'CSS';

// 依赖模块
CSS.prototype.requiredCSS = [];

/**
 * 添加css依赖模块
 * @param {String} x
 */
CSS.prototype.addRequiredCSS = function(x) {
  this._requiredCSSMap[x] = true;
};

/**
 * 确定本模块的依赖项
 */
CSS.prototype.finalize = function() {
  var keys = Object.keys(this._requiredCSSMap);
  if (keys.length) {
    this.requiredCSS = keys;
  }
};

// 导出
module.exports = CSS;