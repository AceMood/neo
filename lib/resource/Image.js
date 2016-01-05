/**
 * @file 图片资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var fs = require('fs');
var node_path = require('path');
var inherits = require('util').inherits;

var Resource = require('./Resource');
var util = require('../util');

// inline类型映射
var extToType = {
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp'
};

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
  getDataUri: function() {
    var ext = node_path.parse(this.path).ext;
    ext = ext ? ext.replace(/\?.*/, '') : '';
    var contentType = extToType[ext] || 'image/png';
    return 'data:' + contentType + ';base64,' + this.getContent('base64');
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
  },
  compile: function() {
    // 暂时不需要具体实现
  }
};

/**
 * @constructor
 * @extends {Resource}
 * @param   {string} path 资源路径
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