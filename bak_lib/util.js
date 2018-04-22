/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 一些实用函数
 * @author AceMood
 */

'use strict';

const fs        = require('fs');
const node_path = require('path');
const exists    = exports.exists = fs.existsSync;

/**
 * 创建目录
 * @param {string}   path 要创建的目录的路径
 * @param {?number=} mode 创建模式
 */
exports.mkdirp = function(path, mode) {
  if (exists(path)) {
    return;
  }

  var _0777 = parseInt('0777', 8);
  if (mode === void 0) {
    mode = _0777 & (~process.umask());
  }

  path.split(node_path.sep).reduce(function(prev, next) {
    if (prev && !exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + node_path.sep + next;
  });

  if (!exists(path)) {
    fs.mkdirSync(path, mode);
  }
};

/**
 * Resolving the absolute file path for a `require(x)` call is actually nuanced
 * and difficult to reimplement. Instead, we'll use an implementation based on
 * node's (private) path resolution to ensure that we're compliant with
 * commonJS. This doesn't take into account `providesModule`, so we deal with
 * that separately.  Unfortunately, node's implementation will read files off of
 * the disk that we've likely already pulled in `ProjectConfigurationLoader`
 * etc, so we can't use it directly - we had to factor out the pure logic into
 * `PathResolver.js`.
 *
 * @param {string} requiredText require()调用的参数.
 * @param {string} callersPath  发起`require()`调用模块的的路径.
 * @return {string} Absolute path of the file corresponding to requiredText, or
 * null if the module can't be resolved.
 */
exports.resolveModulePath = function(requiredText, callersPath) {
  let ret = node_path.dirname(callersPath);
  ret = node_path.join(ret, requiredText);
  ret = node_path.normalize(ret);
  if (node_path.parse(ret).ext === '') {
    ret += '.js';
  }
  return ret;
};

/**
 * 默认忽略的资源规则
 * @param   {string} resourcePath
 * @returns {boolean}
 */
exports.fnIgnore = function(resourcePath) {
  var pathObj = node_path.parse(resourcePath);
  return /^_/.test(pathObj.name);
};

/**
 * 判断给定路径是否网络绝对路径, 即http(s)://开头的路径
 * @param {string} url
 * @returns {boolean}
 */
exports.isAbsUrl = function(url) {
  return /:\/|^\/\//.test(url);
};

/**
 * 测试路径是否目录
 * @param   {string} path
 * @returns {boolean}
 */
exports.isDirPath = function(path) {
  return /\/|\\\\$/.test(path);
};

