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

let fs = require('fs');
let node_path = require('path');

let Resource = require('./Resource');

// inline类型映射
const extToType = {
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp'
};

class Image extends Resource {
  /**
   * @param  {object} obj
   * @returns {Image}
   */
  static fromObject(obj) {
    var image = new Image(obj.path);

    image.path = obj.path;
    image.width = obj.width || 0;
    image.height = obj.height || 0;
    image.mtime = obj.mtime;

    return image;
  }

  /**
   * @param {string} path 资源路径
   */
  constructor(path) {
    super(path);
    this.id = null;
  }

  /**
   * 获得图像的行内数据
   * @return {string}
   */
  getDataUri() {
    var ext = node_path.parse(this.path).ext;
    var contentType = extToType[ext] || 'image/png';
    return 'data:' + contentType + ';base64,' + this.getContent('base64');
  }

  /**
   * 资源转化成对象
   * @returns {object}
   */
  toObject() {
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
}

Image.prototype.width = 0;
Image.prototype.height = 0;
Image.prototype.type = 'Image';
Image.prototype.encoding = 'binary';

module.exports = Image;