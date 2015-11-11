/**
 * @file jsParser对于代码匹配的功能
 */

describe('extract', function() {

  var extract = require('../lib/parser/jsParser');

  describe('require', function() {
    it('should extract normal requires', function() {
      var code =
        'var a = require("foo");\n' +
        'var b = require("bar");\n';
      expect(extract.requireCalls(code)).toEqual(['foo', 'bar']);
    });


    it('should not extract from comments', function() {
      var code =
        '/* a = require("b") */\n' +
        'var a = require("foo");\n' +
        '// var a = require("yada");\n' +
        'var b = require("bar");\n';
      expect(extract.requireCalls(code)).toEqual(['foo', 'bar']);
    });


    it('should extract require at the start', function() {
      var code =
        'require("foo");\n' +
        'var b = require("bar");\n';
      expect(extract.requireCalls(code)).toEqual(['foo', 'bar']);
    });


    it('should ingore non require', function() {
      var code =
        'require("foo");\n' +
        'foo.require("something");\n' +
        'foo_require("something_new");\n' +
        'var b = [require("bar")];\n';
      expect(extract.requireCalls(code)).toEqual(['foo', 'bar']);
    });


    it('should dedupe matches', function() {
      var code =
        'require("foo");\n' +
        'var b = require("foo");\n';
      expect(extract.requireCalls(code)).toEqual(['foo']);
    });
  });

  describe('requireDotAsync', function() {
    it('should extract simplest case', function() {
      var code =
        'require.async(["foo", \'bar\'], function() {\n' +
        '  return 2 + 2;\n';
        '});\n';
      expect(extract.requireAsyncCalls(code)).toEqual(['foo', 'bar']);
    });

    it('should ingore invalid cases', function() {
      var code =
        'foo.require.async(["foo", \'bar\'], function() {\n' +
        '  return 2 + 2;\n';
        '});\n';
      expect(extract.requireAsyncCalls(code)).toEqual([]);
    });

    it('should dedup', function() {
      var code =
        'require.async(["foo", \'bar\'], function(f, b) {\n' +
        '  require.async(["foo", "baz"], function(f, b) {\n' +
        '    alert(1);\n' +
        '  };\n' +
        '  return 2 + 2;\n' +
        '});\n';
      expect(extract.requireAsyncCalls(code)).toEqual(['foo', 'bar', 'baz']);
    });
  });

});
