/**
 * @file 图片资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var inherits = require('util').inherits;
var node_path = require('path');
var Resource = require('./Resource');
var util = require('../util');

/**
 * *.png, *.jpg, *.gif files
 * @constructor
 * @extends {Resource}
 * @param {string} path 资源路径
 */
function Image(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(Image, Resource);

Image.prototype.width = 0;
Image.prototype.height = 0;
Image.prototype.type = 'Image';
Image.prototype.encoding = 'binary';

/**
 * 获取文件内容
 * @return {string}
 */
Image.prototype.getContent = function() {
  if (this._fileContent) {
    return this._fileContent;
  }
  var buf;
  try {
    buf = fs.readFileSync(this.path);
  } catch (e) {
    // todo warning
  }

  this._fileContent = buf.toString(this.encoding);
  return this._fileContent;
};

/**
 * 设置文件内容
 * @param {string|Buffer} content
 */
Image.prototype.setContent = function(content) {
  if (Buffer.isBuffer(content)) {
    this._fileContent = content.toString(this.encoding);
  } else {
    this._fileContent = content || '';
  }
};

/**
 * 资源转化成对象
 * @returns {object}
 */
Image.prototype.toObject = function() {
  var obj = {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };

  if (this.width) {
    obj.width = this.width;
  }
  if (this.height) {
    obj.height = this.height;
  }

  return obj;
};

/**
 * 将资源内容写入到指定位置
 * @param {string} distPath
 * @param {function} callback
 */
Image.prototype.flush = function(distPath, callback) {
  var dir = node_path.parse(distPath).dir;
  if (dir) {
    util.mkdirp(dir);
  }

  var mode = 511 & (~process.umask());
  fs.writeFile(distPath, this.getContent(), {
    encoding: Image.encoding,
    mode: mode
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

/**
 *
 * @return {string}
 */
Image.prototype.getInlineData = function() {

};

/**
 * @static
 * @param {object} obj
 * @returns {Image}
 */
Image.fromObject = function(obj) {
  var image = new Image(obj.path);

  image.path = obj.path;
  image.width = obj.width || 0;
  image.height = obj.height || 0;
  image.mtime = obj.mtime;

  return image;
};

// 导出
module.exports = Image;