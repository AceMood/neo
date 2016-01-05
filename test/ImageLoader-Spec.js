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
 * @file
 * @author AceMood
 * @email zmike86@gmail.com
 */

describe('Image', function() {

  var path = require('path');
  var ImageLoader = require('../lib/loader/ImageLoader');
  var ResourceMap = require('../lib/resource/ResourceMap');
  var loadResouce = require('../__test_helpers__/loadResource');
  var waitsForCallback = require('../__test_helpers__/waitsForCallback');

  it('should match package.json paths', function() {
    var loader = new ImageLoader();
    expect(loader.matchPath('x.png')).toBe(true);
    expect(loader.matchPath('x.jpg')).toBe(true);
    expect(loader.matchPath('a/x.gif')).toBe(true);
    expect(loader.matchPath('a/1.js')).toBe(false);
  });

  var testData = path.join(__dirname, '..', '__test_data__', 'Image');

  it('should find the size of the picture', function() {
    var loader = new ImageLoader();
    loadResouce(
      loader,
      path.join(testData, 'a.jpg'),
      null,
      function(errors, resource) {
        expect(resource.width).toBe(900);
        expect(resource.height).toBe(596);
      });
  });

  it('should calculate network size when asked', function() {
    var loader = new ImageLoader();
    loadResouce(
      loader,
      path.join(testData, 'a.jpg'),
      null,
      function(errors, r) {
        expect(r.networkSize).toBe(127381);
      });
  });

  it('should return form postProcess with 0 resources', function() {
    var loader = new ImageLoader();
    var map = new ResourceMap();
    waitsForCallback(
      function(callback) {
        loader.postProcess(map, [], function() {
          callback();
        });
      },
      function(messages) {
        expect(messages).not.toBe(null);
      }
    );
  });
});
