/**
 * @fileoverview 分析css中的依赖树，产出一份无序去重的文件列表。
 *     分析器不会改变css源代码，甚至去掉import语句，这部分工作在post-process
 *     compiler里面做。
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var css = require('css');

var utils = require('../utils');
var res = require('./cssUrlRegExps');


/**
 * 提取模块中前置依赖和按需依赖
 * @param {String} code css源代码
 */
function retrieve(code) {
  var ast = css.parse(code);

  // stylesheet is the root node returned by css.parse.
  if (ast.stylesheet && ast.stylesheet.rules) {
    var deps = [];
    for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
      var rule = ast.stylesheet.rules[i];
      // import
      if (rule.type === 'import') {
        // 取得依赖模块路径
        var _path = res.getImportUrl(rule.import)[0];
        // 计算其绝对路径
        var dir = path.dirname(absStartPath);
        _path = soi.utils.normalizeSysPath(path.resolve(dir, _path));

        // 方便起见, deps中保存绝对路径
        deps.push(_path);
      }
    }

    if (!tree[absStartPath]) {
      tree[absStartPath] = deps;
    }

    deps.forEach(function(startPath) {
      loop(startPath, encoding);
    });
  }
}

// 导出
exports.retrieve = retrieve;