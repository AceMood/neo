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
 * @file 取得图像大小功能
 * @author AceMood
 * @Stability: 2 - Stable
 *
 * todo 计算后会改变图像buffer
 */

describe("getImageSize", function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var fs = require('fs');
  var root = path.join(__dirname, '..', '__test_data__', 'Image');
  var getImageSize = require('../lib/parser/getImageSize');

  it('should parse gif image size', function() {
    var buffer = fs.readFileSync(node_path.join(root, '200x100.gif'));
    var size = getImageSize(buffer);
    expect(size.width).to.equal(200);
    expect(size.height).to.equal(100);
  });

  it('should parse png image size', function() {
    var buffer = fs.readFileSync(node_path.join(root, '200x100.png'));
    var size = getImageSize(buffer);
    expect(size.width).to.equal(200);
    expect(size.height).to.equal(100);
  });

  it('should parse jpeg image size', function() {
    var buffer = fs.readFileSync(node_path.join(root, '200x100.jpg'));
    var size = getImageSize(buffer);
    expect(size.width).to.equal(200);
    expect(size.height).to.equal(100);
  });

  it('should parse more photo data jpeg image size', function() {
    var buffer = fs.readFileSync(node_path.join(root, 'a.jpg'));
    var size = getImageSize(buffer);
    expect(size.width).to.equal(900);
    expect(size.height).to.equal(596);
  });
});