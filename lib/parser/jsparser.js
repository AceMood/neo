/**
 * @file 依据js源码中对于require方法的调用或者require.async
 *   的调用解析出前置依赖项和按需加载依赖项。
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var UglifyJS = require('uglify-js');
var TreeWalker = UglifyJS.TreeWalker;

// 判断依赖模块
function isRequireCall(node) {
  return node instanceof UglifyJS.AST_Call
      && node.expression
      && node.expression instanceof UglifyJS.AST_SymbolRef
      && node.expression.name === 'require';
}

// 判断异步依赖模块
function isRequireDotAsyncCall(node) {
  return node instanceof UglifyJS.AST_Call
      && node.expression
      && node.expression instanceof UglifyJS.AST_Dot
      && node.expression.property === 'async'
      && node.expression.expression
      && node.expression.expression instanceof UglifyJS.AST_SymbolRef
      && node.expression.expression.name === 'require';
}

/**
 * 提取模块中前置依赖
 * @param {String} code JavaScript源代码
 */
function retrieve(code) {
  if (code.indexOf('require(') === -1) {
    return [];
  }
  var sync = [],
      async = [],
      css = [];

  /**
   * Visitor
   * @param {AST_Node} node
   * @param {Function} descend
   * @returns {Boolean}
   */
  var visitor = function(node, descend) {
    var url;
    if (isRequireCall(node)) {
      // 仅提取`require('module_X')`
      if (node.args.length === 1) {
        url = node.args[0];
        if (url instanceof UglifyJS.AST_String) {
          url = url.getValue();
          if (sync.indexOf(url) === -1) {
            sync.push(url);
          }
        }
      }
    } else if (isRequireDotAsyncCall(node)) {
      // 仅提取`require.async('module_X', callback)`
      if (node.args.length > 0) {
        url = node.args[0];
        if (url instanceof UglifyJS.AST_String) {
          url = url.getValue();
          if (async.indexOf(url) === -1) {
            async.push(url);
          }
        }
      }
    }
  };

  var toplevel = UglifyJS.parse(code);
  var walker = new TreeWalker(visitor);
  toplevel.walk(walker);

  return {
    sync: sync,
    async: async,
    css: css
  };
}

// 导出
exports.retrieve = retrieve;