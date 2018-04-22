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
 * @file 图像加载器功能测试用例
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('ImageLoader', function () {

  var expect = require('chai').expect;
  var node_path = require('path');
  var ImageLoader = require('./loader/ImageLoader');
  var ResourceMap = require('./core/ResourceMap');
  var log = require('et-util-logger');
  global.slogger = new log.Logger();

  var testData = node_path.join(__dirname, '..', '__test_data__', 'Image');

  it('should match package.json paths', function () {
    var loader = new ImageLoader();
    expect(loader.matchPath('x.png')).to.be.true;
    expect(loader.matchPath('x.jpg')).to.be.true;
    expect(loader.matchPath('a/x.gif')).to.be.true;
    expect(loader.matchPath('a/1.js')).to.be.false;
  });

  it('should find the size of the picture', function (done) {
    var loader = new ImageLoader();
    loader.loadFromPath(node_path.join(testData, 'a.jpg'), null, function (r) {
      expect(r.width).to.equal(900);
      expect(r.height).to.equal(596);

      done();
    });
  });

  it('should calculate network size when asked', function (done) {
    var loader = new ImageLoader();
    loader.loadFromPath(node_path.join(testData, 'a.jpg'), null, function (r) {
      expect(r.networkSize).to.equal(127381);

      done();
    });
  });

  it('should return form postProcess with 0 resources', function (done) {
    var loader = new ImageLoader();
    var map = new ResourceMap();

    loader.postProcess(map, [], function (messages) {
      expect(messages).to.be.undefined;
      done();
    });
  });
});

//# sourceMappingURL=ImageLoader-Spec-compiled.js.map