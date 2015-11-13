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
  this.content = this.getRawContent();
}

/**
 * 获得原始文件内容
 */
File.prototype.getRawContent = function() {
  var content = '';
  try {
    content = fs.readFileSync(this._abspath, 'utf8');
  } catch (e) {
    content = '';
  }
  return content;
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