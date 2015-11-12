/**
 * @file 分析css中的依赖树, 不会改变css源代码,
 *     这部分工作在post-process-compiler里面做.
 */

'use strict';

//var fs = require('fs');
//var res = require('./cssUrlRegExps');

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

function rmSpriteArgs(url) {
  return url.replace(/\??&?__sprite&?/, '');
}

var spriteRe = /background[^:]*:\s*url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/g;
var splashRe = /^\//;
function extractSprites(contents) {
  var result = {};
  var match;
  while (match = spriteRe.exec(contents)) {
    result[match[1].replace(splashRe, '')] = 1;
  }
  return Object.keys(result)
      .filter(spriteFilterFn)
      .map(rmSpriteArgs);
}


// 导出
exports.extractSprites = extractSprites;