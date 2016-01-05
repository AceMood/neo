/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
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

Object.keys(proto).forEach(function(prop) {
  Image.prototype[prop] = proto[prop];
});

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