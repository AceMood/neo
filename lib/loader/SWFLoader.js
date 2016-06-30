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
 * @file *.swf文件加载器
 * @author AceMood
 */

/* globals logger */

'use strict';

var fs = require('fs');
var ResourceLoader = require('./ResourceLoader');
var SWF = require('../resource/SWF');

class SWFLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {SWFLoader}
   */
  static fromObject(object) {
    return new SWFLoader(object.options);
  }

  constructor(options) {
    super(options);
  }

  matchPath(filePath) {
    return filePath.lastIndexOf('.swf') === filePath.length - 4;
  }

  getResourceTypes() {
    return [SWF];
  }

  getExtensions() {
    return ['.swf'];
  }

  /**
   * 给定路径创建新资源
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {function}             callback
   */
  loadFromPath(path, configuration, callback) {
    var swf = new SWF(path);
    swf.id = path;

    fs.readFile(path, (err, buffer) => {
      if (err) {
        logger.error(
          'Reading file at:  ' + path,
          err.message
        );
        throw err;
      } else {
        swf.networkSize = buffer.length;
        swf.setContent(buffer.toString(swf.encoding));
        callback(swf);
      }
    });
  }
}

module.exports = SWFLoader;