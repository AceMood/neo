/**
 * @file 分析css中的依赖树, 不会改变css源代码,
 *     这部分工作在post-process-compiler里面做.
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var css = require('css');
var utils = require('../utils');
var res = require('./cssUrlRegExps');

/**
 * 判断是否需要sprite
 * @param {String} url
 * @return {Boolean}
 */
function spriteFilterFn(url) {
  if (url.indexOf('?') === -1) {
    return false;
  }

  url = url.replace(/.*\?/, '');
  var qs = url.split('&'), key;
  for (var i = 0; i < qs.length; ++i) {
    key = qs[i].split('=')[0];
    if (key === '__sprite') {
      return true;
    }
  }

  return false;
}

/**
 * 提取模块中前置依赖
 * @param {String} code css源代码
 * @return {Object} 返回依赖模块的相对路径
 */
function retrieve(code) {
  var ast = css.parse(code);

  var requiredCSSUrls = [];
  var sprites = [];

  // stylesheet is the root node returned by css.parse.
  if (ast.stylesheet && ast.stylesheet.rules) {
    for (var i = 0; i < ast.stylesheet.rules.length; ++i) {
      var rule = ast.stylesheet.rules[i];
      // import
      if (rule.type === 'import') {
        // 取得依赖模块路径
        var requiredCSSUrl = res.getImportUrl(rule.import)[0];
        // 方便起见, requiredCSSUrls中保存绝对路径
        requiredCSSUrls.push(requiredCSSUrl);

      } else if (rule.type === 'rule') {
        // 带有资源定位的属性
        rule.declarations.forEach(function(declaration) {
          var imgs;
          // url("../img/a.png?__sprite") no-repeat;
          // border-image:url(../img/a.png?__sprite) 30 30 round;
          // border-image属性还不能支持图片偏移量, 暂时还不能使用sprite技术
          if (res.BACKGROUND_IMAGE.test(declaration.property)) {
            // 资源位置
            imgs = res.getBgImages(declaration.value).filter(spriteFilterFn);
            imgs.length && (sprites = sprites.concat(imgs));
          }
        });
      }
    }
  }

  return {
    css: requiredCSSUrls,
    sprites: sprites
  };
}

// 导出
exports.retrieve = retrieve;