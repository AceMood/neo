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
 * @file JS资源
 *       资源在自编译的过程中，需要传入资源表对象和规则集，这两个参数测试难度较大且和
 *       soi的task执行过程耦合太大考虑如何优化。
 *       compile会分发以下事件
 *       1. `pre-compile-resource`
 *       2. `compiled-resource`
 *       3. `pre-resolve-resource`
 *       4. `resolved-resource`
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var node_path = require('path');
var UglifyJS = require('uglify-js');
var Resource = require('./Resource');

class JS extends Resource {
  /**
   * 由对象生成资源实例, 并不是toObject的可逆操作, 去除了_开头的属性
   * @param  {object} object
   * @return {Resource}
   */
  static fromObject(object) {
    var instance = new JS(object.path);
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
    this._requiredModuleMap = {};
    this._requiredAsyncModuleMap = {};
    this._requiredTextToResolvedID = {};
  }

  addRequiredModule(x) {
    this._requiredModuleMap[x] = true;
  }

  addRequiredAsyncModule(x) {
    this._requiredAsyncModuleMap[x] = true;
  }

  addRequiredCSS(x) {
    this._requiredCSSMap[x] = true;
  }

  finalize() {
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
  }

  /**
   * `_requiredModuleMap`, '_requiredCSSMap' 和 `_requiredAsyncModuleMap`
   * 记录了源码中require的文字, 在updateTask的后处理之前已经规范成模块Id.
   * `_requiredTextToResolvedID`保存了原文本和ID之间的联系.
   * 如果JS源码是`require('./path/comp.js')`, 则JS资源实例将会有以下属性:
   *
   *   _requiredModuleMap: {'./path/comp.js': true}
   *   requiredModules: ['package-name/path/comp.js']
   *   _requiredTextToResolvedID: {'./path/comp.js': 'package-name/path/comp.js'}
   *
   * @param {string} origName require调用时的原始字符串.
   * @param {string} modID 模块ID.
   */
  recordRequiredModuleOrigin(origName, modID) {
    this._requiredTextToResolvedID[origName] = modID;
  }

  /**
   * @param {string} origName `require('./x/y.js')`调用的原始文本
   * @return {string} canonical module ID.
   */
  getModuleIDByOrigin(origName) {
    return this._requiredTextToResolvedID[origName] || origName;
  }

  compile(map, rules) {
    if (this.isCompiled) {
      return this;
    }

    this.emit('pre-compile-resource', this);

    // 解析js中的资源, 递归编译
    var resource = this;
    var content = this.getContent();
    var ast = UglifyJS.parse(content);

    function refer(node) {
      var path = node.getValue();
      // 如果require不带扩展名称,则加上
      path += path.slice(-3) === '.js' ? '' : '.js';
      path = node_path.join(node_path.dirname(resource.path), path);

      var inlineResource = map.resourcePathMap[path];

      if (!inlineResource) {
        slogger.warn('Require file [', path, '] not found. In file [', resource.path +']');
        return false;
      } else if (inlineResource && !inlineResource.isCompiled) {
        inlineResource.compile(map, rules);
      }

      node.value = inlineResource.id;
      return true;
    }

    ast.walk(new UglifyJS.TreeWalker(function(node) {
      //解析js代码中的require 和 require.async, 替换成模块ID
      var walker = this;

      if (node instanceof UglifyJS.AST_PropAccess
        && node.expression
        && node.expression.name === 'require'
        && node.property === 'async') {

        let args = walker.parent().args.length && walker.parent().args[0].elements;
        if (!args || !args.length) {
          slogger.error('File [', resource.path,
            '], require.async() need one array as params');
          return;
        }

        args.forEach(v => {
          refer(v);
        });
      }

      if (node instanceof UglifyJS.AST_Call
        && node.expression
        && node.expression instanceof UglifyJS.AST_SymbolRef
        && node.expression.name === 'require') {

        // require 解析
        if (!node.args.length) {
          slogger.error('File [' + resource.path + '], require() need one param');
          return;
        }

        refer(node.args[0]);
      }
    }));
    content = ast.print_to_string();
    this.setContent(content);

    this.emit('compiled-resource', this);

    this.isCompiled = true;

    this.emit('pre-resolve-resource', this);

    this.resolveOnlineUri(rules);

    this.emit('resolved-resource', this);

    return this;
  }
}

JS.prototype.networkSize = 0;
// 是否需要cmd包裹
JS.prototype.isModule = false;
// 是否不合并此模块代码
JS.prototype.isNopackage = false;
// 代码是否永远不需要改动
JS.prototype.isPermanent = false;
// 最后生成的script是否要加async
JS.prototype.isNonblocking = false;
JS.prototype.requiredCSS = [];
JS.prototype.type = 'JS';
/**
 * 初始化时, 这些属性保留的是`require()`调用的字符串参数. 通常不是所需要的moduleIDs,
 * 而是一个相对路径. 在后处理`postProcess`之后, 这里面的每一项如果和最初的调用参数不同,
 * 都会被相对的resource IDs代替.
 * 属性`_requiredTextToResolvedID` 记录了源码中的文本和对应的moduleID之间的对应关系.
 * 相应的ID最终会被保存在`requiredModules` 数组中, 你可以利用打包工具查找这个对应关系, 然后
 * 替换掉require的参数.
 */
JS.prototype.requiredModules = [];
JS.prototype.requiredAsyncModules = [];

module.exports = JS;