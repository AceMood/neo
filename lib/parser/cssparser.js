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
 *
 * @param   {string} url
 * @returns {string}
 */
function rmSpriteArgs(url) {
  return url.replace(/\??&?__sprite&?/, '');
}

/**
 *
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