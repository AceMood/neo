/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
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
          expect(r.id).to.equal('plain-style');
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
          expect(r.id).to.equal('special-style');
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

  it('should resolve module id in postProcess', function(done) {
    var neo = new Neo([
      new CSSLoader()
    ], [
      __dirname + '/../__test_data__/Loader'
    ], {
      forceRescan: true
    });

    neo.on('postProcessed', function(map) {
      var id = 'entry';
      var css = map.getResource('css', id);

      // todo _requiredTextToResolvedPath没有测试
      expect(css.id).to.equal('entry');
      expect(css.requiredCSS).to.be.a('array');
      expect(css.requiredCSS).to.be.have.length(2);
      expect(css.requiredCSS).to.deep.equal(['plain','dialog']);

      done();
    });

    neo.update('.cache', function() {});
  });
});
