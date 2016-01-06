/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file CSS资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var Resource = require('./Resource');
var util = require('../util');

class CSS extends Resource {
  /**
   * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了`_`开头的私有属性
   * @param  {object} object
   * @return {Resource}
   */
  static fromObject(object) {
    var instance = new CSS(object.path);
    for (var i in object) {
      instance[i] = object[i];
    }
    return instance;
  };
  /**
   * @param {string} path 资源的路径
   */
  constructor(path) {
    super(path);

    // id重置为空
    this.id = null;
    this._requiredCSSMap = {};
    this._spriteMap = {};
    this._requiredTextToResolvedID = {};
  }
  addRequiredCSS(x) {
    this._requiredCSSMap[x] = true;
  }
  /**
   * 添加css依赖模块
   * @param {string} x
   */
  addSprite(x) {
    this._spriteMap[x] = true;
  }
  finalize() {
    var keys = Object.keys(this._requiredCSSMap);
    if (keys.length) {
      this.requiredCSS = keys;
    }
    keys = Object.keys(this._spriteMap);
    if (keys.length) {
      this.sprites = keys;
    }
  }
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
  recordRequiredModuleOrigin(origName, modID) {
    this._requiredTextToResolvedID[origName] = modID;
  }
  /**
   * @param  {string} origName `require('./x/y.js')`调用的原始文本
   * @return {string} canonical module ID.
   */
  getModuleIDByOrigin(origName) {
    return this._requiredTextToResolvedID[origName] || origName;
  }
}

// 是否不合并此模块代码
CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'CSS';
CSS.prototype.requiredCSS = [];
// 保存雪碧图
CSS.prototype.sprites = [];

module.exports = CSS;