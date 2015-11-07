/**
 * @file 分析css中的依赖树, 不会改变css源代码,
 *     这部分工作在post-process-compiler里面做.
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var node_path = require('path');
var fs = require('fs');

var css = require('css');
var utils = require('../utils');
var res = require('./cssUrlRegExps');

/**
 * 提取模块中前置依赖和按需依赖
 * @param {String} code css源代码
 * @return {Array.<String>} 返回依赖模块的相对路径
 */
function retrieve(code) {
  var ast = css.parse(code);
  var requiredCSSUrls = [];

  // stylesheet is the root node returned by css.parse.
  if (ast.stylesheet && ast.stylesheet.rules) {
    for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
      var rule = ast.stylesheet.rules[i];
      // import
      if (rule.type === 'import') {
        // 取得依赖模块路径
        var requiredCSSUrl = res.getImportUrl(rule.import)[0];
        // 计算其绝对路径
        requiredCSSUrl = node_path.resolve(requiredCSSUrl);

        // 方便起见, requiredCSSUrls中保存绝对路径
        requiredCSSUrls.push(requiredCSSUrl);
      }
    }
  }

  return requiredCSSUrls;
}


var fbSpriteRe = /-fb-sprite\s*:\s*url\s*\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)/g;
var splashRe = /^\//;
function extractFBSprites(contents) {
  var result = {};
  var match;
  while (match = fbSpriteRe.exec(contents)) {
    result[match[1].replace(splashRe, '')] = 1;
  }
  return Object.keys(result);
}

var bgRe = /background[^:]*:.*?url\([\']*([^\)]*\/images\/[^\)]+)[\']*\)/g;
var quoteRe = /'"/g;
function extractBackgroundImages(contents) {
  var result = {};
  var match;
  while (match = bgRe.exec(contents)) {
    result[match[1].replace(splashRe, '').replace(quoteRe, '')] = 1;
  }
  return Object.keys(result);
}

// 导出
exports.retrieve = retrieve;
exports.extractFBSprites = extractFBSprites;
exports.extractBackgroundImages = extractBackgroundImages;