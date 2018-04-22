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
 * @file jsParser对于代码匹配的功能
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('jsParser', function() {

  var expect = require('chai').expect;
  var extract = require('./parser/jsparser');

  describe('require', function() {
    it('should extract normal requires', function() {
      var code =
        'var a = require("foo");\n' +
        'var b = require("bar");\n';

      var ret = extract.requireCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(2);
      expect(ret).to.deep.equal(['foo', 'bar']);
    });


    it('should not extract from comments', function() {
      var code =
        '/* a = require("b") */\n' +
        'var a = require("foo");\n' +
        '// var a = require("yada");\n' +
        'var b = require("bar");\n';

      var ret = extract.requireCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(2);
      expect(ret).to.deep.equal(['foo', 'bar']);
    });


    it('should extract require at the start', function() {
      var code =
        'require("foo");\n' +
        'var b = require("bar");\n';

      var ret = extract.requireCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(2);
      expect(ret).to.deep.equal(['foo', 'bar']);
    });


    it('should ignore non require', function() {
      var code =
        'require("foo");\n' +
        'foo.require("something");\n' +
        'foo_require("something_new");\n' +
        'var b = [require("bar")];\n';

      var ret = extract.requireCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(2);
      expect(ret).to.deep.equal(['foo', 'bar']);
    });


    it('should dedupe matches', function() {
      var code =
        'require("foo");\n' +
        'var b = require("foo");\n';

      var ret = extract.requireCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(1);
      expect(ret).to.deep.equal(['foo']);
    });
  });

  describe('requireDotAsync', function() {
    it('should extract simplest case', function() {
      var code =
        'require.async(["foo", \'bar\'], function() {\n' +
        '  return 2 + 2;\n';
        '});\n';

      var ret = extract.requireAsyncCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(2);
      expect(ret).to.deep.equal(['foo', 'bar']);
    });

    it('should ignore invalid cases', function() {
      var code =
        'foo.require.async(["foo", \'bar\'], function() {\n' +
        '  return 2 + 2;\n' +
        '});\n';

      var ret = extract.requireAsyncCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(0);
      expect(ret).to.deep.equal([]);
    });

    it('should dedup', function() {
      var code =
        'require.async(["foo", \'bar\'], function(f, b) {\n' +
        '  require.async(["foo", "baz"], function(f, b) {\n' +
        '    alert(1);\n' +
        '  };\n' +
        '  return 2 + 2;\n' +
        '});\n';

      var ret = extract.requireAsyncCalls(code);

      expect(ret).to.be.a('array');
      expect(ret).to.have.length(3);
      expect(ret).to.deep.equal(['foo', 'bar', 'baz']);
    });
  });
});