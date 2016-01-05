/**
 * @file 图片资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var inherits = require('util').inherits;
var Resource = require('./Resource');
var util = require('../util');

// 原型方法
var proto = {
  width: 0,
  height: 0,
  type: 'Image',
  encoding: 'binary',
  /**
   * 获得图像的行内数据
   * @return {string}
   */
  getInlineData: function() {

  },
  /**
   * 资源转化成对象
   * @returns {object}
   */
  toObject: function() {
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
  }
};

/**
 * @constructor
 * @extends {Resource}
 * @param {string} path 资源路径
 */
function Image(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(Image, Resource);

Image.prototype = Object.create(proto);

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