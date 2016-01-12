/**
 * @file 资源表序列化的功能
 * @Stability: 2 - Stable
 */

describe('MapSerializer', function() {

  var MapSerializer = require('../lib/MapSerializer');
  var ResourceMap = require('../lib/map/ResourceMap');
  var JS = require('../lib/resource/JS');
  var CSS = require('../lib/resource/CSS');
  var JSLoader = require('../lib/loader/JSLoader');
  var CSSLoader = require('../lib/loader/CSSLoader');

  it('should serialize resource map with a single object', function() {
    var loaders = [new JSLoader(), new CSSLoader()];
    var serializer = new MapSerializer(loaders);
    var map = new ResourceMap([
      JS.fromObject({
        path: 'a/b.js',
        id: 'b',
        requiredModules: ['foo', 'bar']
      })
    ]);

    var map2 = serializer.fromObject(serializer.toObject(map));
    expect(map2.getAllResources().length).toBe(1);
    expect(map2.getResource('JS', 'b').requiredModules).toEqual(['foo', 'bar']);
  });

  it('should serialize resource map with multiple objects', function() {
    var loaders = [new JSLoader(), new CSSLoader()];
    var serializer = new MapSerializer(loaders);
    var map = new ResourceMap([
      JS.fromObject({
        path: 'a/b.js',
        id: 'b',
        requiredModules: ['foo', 'bar']
      }),
      CSS.fromObject({
        path: 'a/b.css',
        id: 'b-css'
      })
    ]);

    var map2 = serializer.fromObject(serializer.toObject(map));
    expect(map2.getAllResources().length).toBe(2);
    expect(map2.getResource('JS', 'b') instanceof JS).toBe(true, 'JS');
    expect(map2.getResource('CSS', 'b-css') instanceof CSS).toBe(true, 'CSS');
  });

  it('should serialize to a file', function() {
    var fs = require('fs');
    var data = null;
    spyOn(fs, 'writeFile').andCallFake(function(path, d, enc, callback) {
      data = d;
      callback();
    });
    spyOn(fs, 'readFile').andCallFake(function(path, enc, callback) {
      callback(null, data);
    });
    var loaders = [new JSLoader(), new CSSLoader()];
    var serializer = new MapSerializer(loaders);
    var map = new ResourceMap([
      JS.fromObject({
        path: 'a/b.js',
        id: 'b',
        requiredModules: ['foo', 'bar']
      })
    ]);

    var map2 = null;
    runs(function() {
      serializer.storeToPath('tmp', map, function() {
        serializer.loadFromPath('tmp', function(err, m) {
          map2 = m;
        });
      });
    });

    waitsFor(function() {
      return map2;
    }, 100);

    runs(function() {
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.readFile).toHaveBeenCalled();
      expect(map2.getAllResources().length).toBe(1);
      expect(map2.getResource('JS', 'b').requiredModules)
        .toEqual(['foo', 'bar']);
    });
  });

  it('should return null when version changes', function() {
    var loaders = [new JSLoader(), new CSSLoader()];
    var serializer1 = new MapSerializer(loaders, { version: '0.1' });
    var serializer2 = new MapSerializer(loaders, { version: '0.2' });
    var map = new ResourceMap([
      JS.fromObject({
        path: 'a/b.js',
        id: 'b',
        requiredModules: ['foo', 'bar']
      }),
      CSS.fromObject({
        path: 'a/b.css',
        id: 'b-css'
      })
    ]);

    var ser = serializer1.toObject(map);
    var map2 = serializer2.fromObject(ser);
    expect(map2).toBe(null);
  });

});