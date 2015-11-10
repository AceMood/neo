/**
 * @file 通过正则解析js源码
 */

'use strict';

var blockCommentRe = /\/\*(.|\n)*?\*\//g;
var lineCommentRe = /\/\/.+(\n|$)/g;

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

var requireRe = /\brequire\s*\(\s*['"]([^"']+)["']\s*\)/g;
function requireCalls(code) {
  if (code.indexOf('require(') === -1) {
    return [];
  }
  return extractStrings(code, requireRe, 1);
}

var requireAsyncRe = /\brequire.async\s*\(\s*\[([^\]]+)]/g;
function requireAsyncCalls(code) {
  if (code.indexOf('require.async(') === -1) {
    return [];
  }
  return extractStringArrays(code, requireAsyncRe, 1);
}

var loadModulesRe = /\bBootloader\.loadModules\s*\(\s*(?:\[([^\]]+)])?/g;
function loadModules(code) {
  if (code.indexOf('Bootloader.loadModules(') === -1) {
    return [];
  }
  return extractStringArrays(code, loadModulesRe, 1);
}

var loadComponentsRe =
  /\bBootloader\.loadComponents\s*\(\s*(?:\[([^\]]+)]|(['"][^'"]+['"]))/g;
function loadComponents(code) {
  if (code.indexOf('Bootloader.loadComponents(') === -1) {
    return [];
  }
  return extractStringArrays(code, loadComponentsRe, 1, 2);
}

// 导出
exports.strings = extractStrings;
exports.requireCalls = requireCalls;
exports.requireAsyncCalls = requireAsyncCalls;
exports.loadModules = loadModules;
exports.loadComponents = loadComponents;