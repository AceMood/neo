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
 * @file 图像加载器
 * @author AceMood
 */

/* globals slogger */

'use strict';

var fs = require('fs');
var ResourceLoader = require('./ResourceLoader');
var Image = require('../resource/Image');
var getImageSize = require('../parser/getImageSize');

const re = /\.(jpg|jpeg|gif|png|webp|bmp)$/;

class ImageLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {ImageLoader}
   */
  static fromObject(object) {
    return new ImageLoader(object.options);
  }

  /**
   * @param {?object} options Object with the following options:
   */
  constructor(options) {
    super(options);
  }

  getResourceTypes() {
    return [Image];
  }

  getExtensions() {
    return ['.jpg', 'jpeg', '.png', '.gif', '.webp', '.bmp'];
  }

  /**
   * 给定路径创建新资源
   * @protected
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {function}             callback
   */
  loadFromPath(path, configuration, callback) {
    var image = new Image(path);
    var me = this;
    image.id = path;
    fs.readFile(path, (err, buffer) => {
      if (err) {
        slogger.error(
          'Reading file at:  ' + path,
          err.message
        );
        throw err;
      } else {
        image.networkSize = buffer.length;
        image.setContent(buffer.toString(image.encoding));

        let size = getImageSize(buffer);
        if (size) {
          image.width = size.width;
          image.height = size.height;
        }

        callback(image);
      }
    });
  }

  /**
   * @param  {string} filePath
   * @return {boolean}
   */
  matchPath(filePath) {
    return re.test(filePath);
  }
}

module.exports = ImageLoader;