/**
 * @fileoverview 图片资源 todo 初始化重新覆盖path?
 */

'use strict';

var inherits = require('util').inherits;

var Resource = require('./Resource');

/**
 * *.png, *.jpg, *.gif files
 * @constructor
 * @extends {Resource}
 * @param {String} path 资源路径
 */
function Image(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(Image, Resource);
Image.__proto__ = Resource;

Image.prototype.width = 0;
Image.prototype.height = 0;
Image.prototype.type = 'Image';
// todo need version?
Image.prototype.version = '0.1';

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