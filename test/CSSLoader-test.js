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
 * @file CSSLoader功能测试
 * @author AceMood
 * @Stability: 2 - Stable
 */

describe('CSSLoader', function() {

  var path = require('path');
  var CSSLoader = require('../lib/loader/CSSLoader');
  var loadResouce = require('../__test_helpers__/loadResource');

  it('should match package.json paths', function() {
    var loader = new CSSLoader();
    expect(loader.matchPath('x.css')).toBe(true);
    expect(loader.matchPath('a/x.css')).toBe(true);
    expect(loader.matchPath('a/1.js')).toBe(false);
  });

  var testData = path.join(__dirname, '..', '__test_data__', 'CSS');

  it('should extract component name', function() {
    loadResouce(
      new CSSLoader(),
      path.join(testData, 'plain.css'),
      null,
      function(err, css) {
        expect(css.id).toBe('plain-css');
        expect(css.options).toEqual(undefined);
        expect(css.requiredCSS).toEqual(['bar']);
      });
  });

  it('should parse special attributes', function() {
    loadResouce(
      new CSSLoader(),
      path.join(testData, 'special.css'),
      null,
      function(err, css) {
        expect(css.id).toBe('special-css');
        expect(css.isNonblocking).toBe(true);
        expect(css.isNopackage).toBe(true);
      });
  });

  it('should extract css sprites', function() {
    loadResouce(
      new CSSLoader({ extractSprites: true }),
      path.join(testData, 'sprite.css'),
      null,
      function(err, css) {
        expect(css.sprites).toEqual([
          'images/dialog/halo_top_left.png',
          'images/dialog/large_halo_top_left.png'
        ]);
      });
  });

  it('should extract network size', function() {
    loadResouce(
      new CSSLoader({ networkSize: true }),
      path.join(testData, 'sprite.css'),
      null,
      function(err, css) {
        expect(css.networkSize > 0).toBe(true);
      });
  });

});
