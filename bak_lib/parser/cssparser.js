/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 分析css中的依赖树, 不会改变css源代码
 * @author AceMood
 */

'use strict';

const spriteRe = /background[^:]*:\s*url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/g;
const splashRe = /^\//;

/**
 * 判断是否需要sprite
 * @param {string} url
 * @return {boolean}
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
 * @param   {string} url
 * @returns {string}
 */
function rmSpriteArgs(url) {
  return url.replace(/\??&?__sprite&?/, '');
}

/**
 * @param   {string} contents
 * @returns {Array}
 */
function extractSprites(contents) {
  var result = {};
  var match = spriteRe.exec(contents);
  while (match) {
    result[match[1].replace(splashRe, '')] = 1;
    match = spriteRe.exec(contents);
  }

  return Object.keys(result)
      .filter(spriteFilterFn)
      .map(rmSpriteArgs);
}

exports.extractSprites = extractSprites;