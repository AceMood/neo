/**
 * @fileoverview
 * @email zmike86@gmail.com
 */

'use strict';

var blockCommentRe = /\/\*(.|\n)*?\*\//g;
var lineCommentRe = /\/\/.+(\n|$)/g;

function extractStrings(code, regex, index) {
  // 去掉注释
  code = code
      .replace(blockCommentRe, '')
      .replace(lineCommentRe, '');

  var match;
  var visited = {};

  while (match = regex.exec(code)) {
    // manually check for preceding dot since we don't have backreferences
    if (match.index === 0 || code.charAt(match.index - 1) !== '.' &&
        match[index]) {
      visited[match[index]] = 1;
    }
  }
  return Object.keys(visited);
}


function extractStringArrays(code, regex, index, index2) {
  // 去掉注释
  code = code
      .replace(blockCommentRe, '')
      .replace(lineCommentRe, '');

  var match;
  var visited = {};
  var m;
  while (match = regex.exec(code)) {
    if (match.index === 0 || code.charAt(match.index - 1) !== '.') {
      m = match[index] || (index2 && match[index2]);
      if (m) {
        try {
          JSON.parse('[' + m.replace(/'/g, '"') + ']')
              .forEach(function(key) {
                visited[key] = 1;
              });
        } catch(e) {}
      }
    }
  }
  return Object.keys(visited);
}

var requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
function requireCalls(code) {
  if (code.indexOf('require(') === -1) {
    return [];
  }
  return extractStrings(code, requireRe, 1);
}

var requireLazyRe = /\brequireLazy\s*\(\s*\[([^\]]+)\]/g;
function requireLazyCalls(code) {
  if (code.indexOf('requireLazy(') === -1) {
    return [];
  }
  return extractStringArrays(code, requireLazyRe, 1);
}

var loadModulesRe = /\bBootloader\.loadModules\s*\(\s*(?:\[([^\]]+)\])?/g;
function loadModules(code) {
  if (code.indexOf('Bootloader.loadModules(') === -1) {
    return [];
  }
  return extractStringArrays(code, loadModulesRe, 1);
}

var loadComponentsRe =
    /\bBootloader\.loadComponents\s*\(\s*(?:\[([^\]]+)\]|([\'"][^\'"]+[\'"]))/g;
function loadComponents(code) {
  if (code.indexOf('Bootloader.loadComponents(') === -1) {
    return [];
  }
  return extractStringArrays(code, loadComponentsRe, 1, 2);
}


var cxModulesRe = /\bcx\s*\(\s*([^)]+)\s*\)/g;
function cxModules(code) {
  if (code.indexOf('cx(') === -1) {
    return [];
  }
  var map = {};
  extractStringArrays(code, cxModulesRe, 1).forEach(function(m) {
    var parts = m.split('/');
    if (parts[0] === 'public') {
      parts = parts.slice(1);
    }
    if (parts.length > 1 && parts[0]) {
      map[parts[0]] = 1;
    }
  });
  return Object.keys(map);
}


exports.strings = extractStrings;
exports.requireCalls = requireCalls;
exports.requireLazyCalls = requireLazyCalls;
exports.loadModules = loadModules;
exports.loadComponents = loadComponents;
exports.cxModules = cxModules;





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
 * traverse ast tree
 * @param {String} code JavaScript源代码
 */
function retrieve(code) {
  var sync = [],
      async = [];

  /**
   * Visitor
   * @param {AST_Node} node
   * @param {Function} descend
   * @returns {boolean}
   */
  var visitor = function(node, descend) {
    var url;
    if (isRequireCall(node)) {
      // 仅提取`require('xxx')`
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
      // 仅提取`require.async('xxx', callback)`
      if (node.args.length > 0) {
        url = node.args[0];
        if (mod instanceof UglifyJS.AST_String) {
          url = mod.getValue();
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
    async: async
  };
}

// 导出
module.exports = retrieve;