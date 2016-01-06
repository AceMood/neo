/**
 * @file 通过正则解析js源码
 */

'use strict';

const blockCommentRe = /\/\*(.|\n)*?\*\//g;
const lineCommentRe = /\/\/.+(\n|$)/g;

function extractStrings(code, regex, index) {
  // clean up most comments
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
  // clean up most comments
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

const requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
function requireCalls(code) {
  if (code.indexOf('require(') === -1) {
    return [];
  }
  return extractStrings(code, requireRe, 1);
}

const requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;
function requireAsyncCalls(code) {
  if (code.indexOf('require.async(') === -1) {
    return [];
  }
  return extractStringArrays(code, requireAsyncRe, 1);
}

// 导出
exports.strings = extractStrings;
exports.requireCalls = requireCalls;
exports.requireAsyncCalls = requireAsyncCalls;