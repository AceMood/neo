/**
 * @file 图片资源
 * @author AceMood
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');

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

/**
 * 获取文件内容
 * @return {string|Buffer}
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
  // 这里返回原始buffer
  this._fileContent = buf;
  return this._fileContent;
};

/**
 * 设置文件内容
 * @param {string|Buffer} content
 */
Image.prototype.setContent = function(content) {
  // 确保this._fileContent是Buffer实例
  if (content instanceof Buffer) {
    this._fileContent = content;
  } else {
    this._fileContent = new Buffer(content || '');
  }
};

/**
 * @static
 * @param {Object} obj
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

/**
 * 资源转化成对象
 * @returns {Object}
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

// 导出
module.exports = Image;