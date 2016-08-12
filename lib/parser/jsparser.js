/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file parse javascript source code
 * @author AceMood
 */

/* globals logger */

'use strict';

const regexp          = require('./regexp');
const blockCommentRe  = regexp.blockCommentRe;
const lineCommentRe   = regexp.lineCommentRe;
const requireRe       = regexp.requireRe;
const requireAsyncRe  = regexp.requireAsyncRe;

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

  var match = regex.exec(code);
  var visited = {};
  while (match) {
    // manually check for preceding dot since we don't have back references
    if (match.index === 0 || code.charAt(match.index - 1) !== '.' &&
      match[index]) {
      visited[match[index]] = 1;
    }

    match = regex.exec(code);
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
        } catch(err) {
          logger.error(
            'require.async parameter need an array. ',
            err.message
          );
          throw err;
        }
      }
    }

    match = regex.exec(code);
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