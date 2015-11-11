/**
 * @file 文件类
 * @author AceMood
 */

'use strict';

var node_path = require('path');
var fs = require('fs');
var crypto = require('crypto');

/**
 * 文件类
 * @param {string} path 文件相对路径
 * @param {?string=} type
 * @constructor
 */
function File(path, type) {
  this.path = path;
  this._abspath = node_path.resolve(path);
  this.type = type;
  this.content = '';

  this.getRawContent();
}

/**
 * 获得原始文件内容
 */
File.prototype.getRawContent = function() {
  try {
    this.content = fs.readFileSync(this._abspath, 'utf8');
  } catch (e) {
    this.content = '';
  }
};

// 设置文件内容
File.prototype.setContent = function(content) {
  this.content = content || '';
};

// 获取文件内容
File.prototype.getContent = function() {
  return this.content;
};

/**
 * 将文件内容写入到指定位置
 * @param {String} path
 * @param {Function} callback
 */
File.prototype.flush = function(path, callback) {
  var oldPath = node_path.resolve(path);
  var dirname = node_path.dirname(oldPath),
      ext = node_path.extname(oldPath),
      basename = node_path.basename(oldPath, ext);
  var newPath = node_path.join(dirname, basename + '.' + this.hash() + ext);

  fs.writeFile(oldPath, this.content, 'utf8', function(err) {
    if (err) {
      throw err;
    }

    fs.renameSync(oldPath, newPath);

    callback();
  });
};

/**
 * 生成文件内容指纹
 * @param {Number=} len
 * @returns {String}
 */
File.prototype.hash = function(len) {
  var md5 = crypto.createHash('md5');
  md5.update(this.content);
  return md5.digest('hex').substr(0, len || 7);
};

// 导出
module.exports = File;