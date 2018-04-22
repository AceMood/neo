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
 *       资源在自编译的过程中，需要传入资源表对象和规则集，这两个参数测试难度较大且和
 *       soi的task执行过程耦合太大考虑如何优化。
 *       compile会分发以下事件
 *       1. `pre-compile-resource`
 *       2. `compiled-resource`
 *       3. `pre-resolve-resource`
 *       4. `resolved-resource`
 * @author AceMood
 */

'use strict';

var node_path = require('path');
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
    for (let i in object) {
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
    this._requiredTextToResolvedPath = {};
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
   * `_requiredCSSMap`记录了头注释中css指令依赖的文件, 在updateTask的后处理之前
   * 已经规范成资源Id. `_requiredTextToResolvedPath`保存了原文本和Id之间的联系.
   * 如果源码是 @css './path/comp.css', 则CSS资源实例将会有以下属性:
   *   _requiredCSSMap: {'./path/comp.css': true}
   *   requiredCSS:     ['package-name/path/comp.css']
   *   _requiredTextToResolvedPath: {'./path/comp.css': 'package-name/path/comp.css'}
   *
   * @param {string} origName @css指令中的原始字符串.
   * @param {string} path css模块path.
   */
  recordRequiredModuleOrigin(origName, path) {
    this._requiredTextToResolvedPath[origName] = path;
  }

  /**
   * @param  {string} origName @css './x/y.css'的原始文本
   * @return {string} canonical module ID.
   */
  getModulePathByOrigin(origName) {
    return this._requiredTextToResolvedPath[origName] || origName;
  }
}

// 是否不合并此模块代码
CSS.prototype.isNopackage = false;
CSS.prototype.isNonblocking = false;

// 代码是否永远不需要改动
CSS.prototype.isPermanent = false;
CSS.prototype.networkSize = 0;
CSS.prototype.type = 'css';
// 依赖的css模块
CSS.prototype.requiredCSS = [];
// 保存雪碧图
CSS.prototype.sprites = [];

module.exports = CSS;