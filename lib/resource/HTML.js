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
 * @file HTML资源类
 * @author AceMood
 */

'use strict';

var Resource = require('./Resource');

class HTML extends Resource {
  /**
   * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了_开头的属性
   * @param  {object} object
   * @return {Resource}
   */
  static fromObject(object) {
    var instance = new HTML(object.path);
    for (var i in object) {
      instance[i] = object[i];
    }
    return instance;
  }

  /**
   * @param {string} path 资源路径
   */
  constructor(path) {
    super(path);

    this.id = null;
    this._requiredCSSMap = {};
    this._requiredJSMap = {};
    this._requiredImageMap = {};
    this._requiredHTMLMap = {};
    this._requiredTextToResolvedID = {};
  }

  addRequiredJS(x) {
    this._requiredJSMap[x] = true;
  }

  addRequiredImage(x) {
    this._requiredImageMap[x] = true;
  }

  addRequiredHTML(x) {
    this._requiredHTMLMap[x] = true;
  }

  addRequiredCSS(x) {
    this._requiredCSSMap[x] = true;
  }

  /**
   * 标准依赖模块
   */
  finalize() {
    this.requiredJS = Object.keys(this._requiredJSMap);
    this.requiredImage = Object.keys(this._requiredImageMap);
    this.requiredCSS = Object.keys(this._requiredCSSMap);
    this.requiredHTML = Object.keys(this._requiredHTMLMap);
  }

  /**
   *
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
  recordRequiredModuleOrigin(origName, modID) {
    this._requiredTextToResolvedID[origName] = modID;
  }

  /**
   * @param {string} origName html中引用的源码路径, 如'<script src="app.js"></script>'
   *                          中的app.js
   * @return {string} 规范后的引用资源ID.
   */
  getModuleIDByOrigin(origName) {
    return this._requiredTextToResolvedID[origName] || origName;
  }

  compile(map, rules) {

  }
}

// 默认属性移到prototype, 减少序列化后的对象属性
HTML.prototype.networkSize = 0;
HTML.prototype.type = 'HTML';
HTML.prototype.isPage = true;

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

module.exports = HTML;