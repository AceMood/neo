/**
 * @file util functions
 */

'use strict';

var fs = require('fs');
var node_path = require('path');

var exists = exports.exists = fs.existsSync || node_path.existsSync;

/**
 * 创建目录
 * @param {string} fpath 要创建的目录的路径
 * @param {?number=} mode 创建模式
 */
var mkdirp = exports.mkdirp = function(fpath, mode) {
  if (exists(fpath)) {
    return;
  }

  if (typeof mode === 'undefined') {
    mode = 511 & (~process.umask());
  }

  fpath.split(path.sep).reduce(function(prev, next) {
    if (prev && !_util.exists(prev)) {
      fs.mkdirSync(prev, mode);
    }
    return prev + path.sep + next;
  });

  if (!exists(fpath)) {
    fs.mkdirSync(fpath, mode);
  }
};