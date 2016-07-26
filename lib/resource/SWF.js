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
 * @file SWF资源
 * @author AceMood
 */

'use strict';

var Resource = require('./Resource');

class SWF extends Resource {
  /**
   * @param {object} obj
   * @returns {SWF}
   */
  static fromObject(obj) {
    var swf = new SWF(obj.path);
    swf.id = obj.id;
    swf.path = obj.path;
    swf.mtime = obj.mtime;
    return swf;
  }
  /**
   * @param {string} path 资源路径
   */
  constructor(path) {
    super(path);
    this.id = null;
  }
  /**
   * 资源转化成对象
   * @returns {object}
   */
  toObject() {
    return {
      path: this.path,
      id: this.id,
      type: this.type,
      mtime: this.mtime
    };
  }
}

SWF.prototype.type = 'swf';
SWF.prototype.encoding = 'binary';

module.exports = SWF;