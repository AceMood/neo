/**
 * @file util functions
 * @author AceMood
 */

'use strict';

var fs = require('fs');
var node_path = require('path');
var PathResolver = require('./PathResolver');

var exists = exports.exists = fs.existsSync || node_path.existsSync;

/**
 * 创建目录
 * @param {string} fpath 要创建的目录的路径
 * @param {?number=} mode 创建模式
 */
exports.mkdirp = function(fpath, mode) {
  if (exists(fpath)) {
    return;
  }

  if (mode === void 0) {
    mode = 511 & (~process.umask());
  }

  fpath.split(node_path.sep).reduce(function(prev, next) {
    if (prev && !exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + node_path.sep + next;
  });

  if (!exists(fpath)) {
    fs.mkdirSync(fpath, mode);
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
 * @param {string} requiredText ｀require()`调用的参数.
 * @param {string} callersPath 发起`require()`调用模块的的路径.
 * @param {ResourceMap} resourceMap ResourceMap containing project configs and
 * JS resources.
 * @return {string} Absolute path of the file corresponding to requiredText, or
 * null if the module can't be resolved.
 */
exports.findAbsolutePathForRequired =
  function(requiredText, callersPath, resourceMap) {
    var callerData = {
      id: callersPath,
      paths: resourceMap.getAllInferredProjectPaths(),
      fileName: callersPath
    };

    return PathResolver._resolveFileName(requiredText, callerData, resourceMap);
  };

/**
 * 默认忽略的资源规则
 * @param {string} resourcePath
 * @returns {boolean}
 */
exports.fnIgnore = function(resourcePath) {
  var pathObj = node_path.parse(resourcePath);
  return /^_/.test(pathObj.name);
};