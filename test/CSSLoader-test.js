/**
 * @file CSSLoader功能测试
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
