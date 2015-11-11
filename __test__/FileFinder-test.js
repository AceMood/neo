/**
 * @file FileFinder功能测试
 */

describe("FileFinder", function() {

  var path = require('path');
  var Finder = require('../lib/FileFinder');

  var workingDir = path.join(__dirname, '../__test_data__/FileFinder');

  it("should find files in a directory using FileFinder object", function() {
    var result,
        find = new Finder({
          scanDirs: [workingDir],
          extensions: ['.js'],
          useNative: true,
          ignore: null
        });

    runs(function() {
      find.find(function(files) {
        result = files;
      });
    });

    waitsFor(function() {
      return result;
    }, 300);

    runs(function() {
      var files = result.map(function(r) {
        return r[0];
      });
      expect(files.join('\n')).toContain(path.join('sub','1.js'));
      expect(files.join('\n')).toContain(path.join('sub','2.js'));
      expect(files.join('\n')).toContain('3.js');
    });
  });

  it("should find files in a directory", function() {
    var result;
    runs(function() {
      Finder.find([workingDir], ['.js'], null, function(files) {
        result = files;
      });
    });

    waitsFor(function() {
      return result;
    }, 300);

    runs(function() {
      var files = result.map(function(r) {
        return r[0];
      });
      expect(files.join('\n')).toContain(path.join('sub','1.js'));
      expect(files.join('\n')).toContain(path.join('sub','2.js'));
      expect(files.join('\n')).toContain('3.js');
    });
  });

  it("should find files in a directory using native find", function() {
    var result;
    runs(function() {
      Finder.findNative([workingDir], ['.js'], null, function(files) {
        result = files;
      });
    });

    waitsFor(function() {
      return result;
    }, 300);

    runs(function() {
      var files = result.map(function(r) {
        return r[0];
      });
      expect(files.join('\n')).toContain(path.join('sub','2.js'));
      expect(files.join('\n')).toContain(path.join('sub','2.js'));
      expect(files.join('\n')).toContain('3.js');
    });
  });
});