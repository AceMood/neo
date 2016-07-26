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
 */

/* globals describe */
/* globals it */

describe('CSSLoader', function() {

  var expect = require('chai').expect;
  var fs = require('fs');
  var node_path = require('path');

  var Neo = require('../lib/neo');
  var CSSLoader = require('../lib/loader/CSSLoader');
  var log = require('et-util-logger');
  global.logger = new log.Logger();

  var testData = node_path.join(__dirname, '..', '__test_data__', 'CSS');

  beforeEach(function() {
    if (fs.existsSync('.cache')) {
      fs.unlinkSync('.cache');
    }
  });

  after(function() {
    if (fs.existsSync('.cache')) {
      fs.unlinkSync('.cache');
    }
  });

  it('should match css file paths', function() {
    var loader = new CSSLoader();
    expect(loader.matchPath('x.css')).to.be.true;
    expect(loader.matchPath('a/x.css')).to.be.true;
    expect(loader.matchPath('a/1.js')).to.be.false;
  });

  it('should extract component name', function(done) {
    var loader = new CSSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'plain.css'),
      null,
      function(r) {
        expect(r.id).to.equal(r.path);
        expect(r.options).to.be.undefined;
        expect(r.requiredCSS).to.be.a('array');
        expect(r.requiredCSS).to.have.length(1);
        expect(r.requiredCSS).to.deep.equal(['bar']);

        done();
      });
  });

  it('should parse special attributes', function(done) {
    var loader = new CSSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'special.css'),
      null,
      function(r) {
        expect(r.id).to.equal(r.path);
        expect(r.isNonblocking).to.be.true;
        expect(r.isNopackage).to.be.true;

        done();
      });
  });

  it('should extract css sprites', function(done) {
    var loader = new CSSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'sprite.css'),
      null,
      function(r) {
        expect(r.sprites).to.be.a('array');
        expect(r.sprites).to.have.length(2);
        expect(r.sprites).to.deep.equal([
          'images/dialog/halo_top_left.png',
          'images/dialog/large_halo_top_left.png'
        ]);

        done();
      });
  });

  xit('should resolve module id in postProcess', function(done) {
    var neo = new Neo([
      new CSSLoader()
    ], [
      __dirname + '/../__test_data__/Loader'
    ], {
      forceRescan: true
    });

    neo.on('postProcessed', function(map) {
      var id = '__test_data__/Loader/entry.css';
      var css = map.getResource('css', id);

      expect(css.id).to.equal('__test_data__/Loader/entry.css');
      expect(css.requiredCSS).to.be.a('array');
      expect(css.requiredCSS).to.be.have.length(2);
      expect(css.requiredCSS).to.deep.equal([
        node_path.resolve(__dirname + '/../__test_data__/Loader/plain.css'),
        node_path.resolve(__dirname + '/../__test_data__/Loader/dialog.css')
      ]);

      done();
    });

    neo.update('.cache', function() {});
  });
});
