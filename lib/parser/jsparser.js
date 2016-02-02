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
 * @file 解析js源码
 * @author AceMood
 */

'use strict';

var regexp = require('./regexp');
var blockCommentRe = regexp.blockCommentRe;
var lineCommentRe = regexp.lineCommentRe;
var requireRe = regexp.requireRe;
var requireAsyncRe = regexp.requireAsyncRe;

/**
 * 从require中提取依赖模块
 * @param   {string} code
 * @param   {RegExp} regex
 * @param   {number} index
 * @returns {Array}
 */
function extractStrings(code, regex, index) {
  // clean up most comments
  code = code
    .replace(blockCommentRe, '')
    .replace(lineCommentRe, '');

  var match;
  var visited = {};
  while (match = regex.exec(code)) {
    // manually check for preceding dot since we don't have back references
    if (match.index === 0 || code.charAt(match.index - 1) !== '.' &&
      match[index]) {
      visited[match[index]] = 1;
    }
  }
  return Object.keys(visited);
}

/**
 * 从代码中匹配require.async的数组
 * @param   {string} code
 * @param   {RegExp} regex
 * @param   {number} index
 * @param   {number} index2
 * @returns {Array}
 */
function extractStringArrays(code, regex, index, index2) {
  // clean up most comments
  code = code
    .replace(blockCommentRe, '')
    .replace(lineCommentRe, '');

  var match = regex.exec(code);
  var visited = {};
  var m;

  /**
   * 记录依赖模块
   * @param {string} key
   */
  function record(key) {
    visited[key] = 1;
  }

  while (match) {
    if (match.index === 0 || code.charAt(match.index - 1) !== '.') {
      m = match[index] || (index2 && match[index2]);
      if (m) {
        try {
          JSON
            .parse('[' + m.replace(/'/g, '"') + ']')
            .forEach(record);
        } catch(e) {}
      }
    }

    match = regex.exec(code)
  }
  return Object.keys(visited);
}

/**
 * 提取源码中的require调用
 * @param {string} code
 * @returns {Array}
 */
function requireCalls(code) {
  if (code.indexOf('require(') === -1) {
    return [];
  }
  return extractStrings(code, requireRe, 1);
}

/**
 * 提取源码中的require.async调用
 * @param {string} code
 * @returns {Array}
 */
function requireAsyncCalls(code) {
  if (code.indexOf('require.async(') === -1) {
    return [];
  }
  return extractStringArrays(code, requireAsyncRe, 1);
}

exports.requireCalls = requireCalls;
exports.requireAsyncCalls = requireAsyncCalls;