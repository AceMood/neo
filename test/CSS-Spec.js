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
 * @file CSS资源功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('CSS Resource', function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var fs = require('fs');
  var CSS = require('../lib/resource/CSS');

  var testData = node_path.join(__dirname, '..', '__test_data__', 'CSS');

  it('should have a css type', function() {
    var css = new CSS('a');
    expect(css.type).to.equal('css');
  });

  it('should have a relative path', function() {
    var css = new CSS('a');
    expect(css.path).to.deep.equal('a');
  });

  it('should have a null id', function() {
    var css = new CSS('a');
    expect(css.id).to.be.null;
  });

  it('should can retrieve file content', function() {
    var css = new CSS(node_path.join(testData, 'empty.css'));
    expect(css.getContent()).to.deep.equal('');
    css = new CSS(node_path.join(testData, 'onerule.css'));
    expect(css.getContent()).to.deep.equal('div { font-size: 12em }');
  });

  it('should can set file content', function() {
    var cssContent = 'html, body { border: 0 }';
    var css = new CSS(node_path.join(testData, 'empty.css'));
    css.setContent(cssContent);
    expect(css.getContent()).to.deep.equal(cssContent);
    css.setContent('');
    expect(css.getContent()).to.deep.equal('');
  });

  it('should flush content to destination', function(done) {
    var css = new CSS(node_path.join(testData, 'empty.css'));
    var cssContent = 'html, body { border: 0 }';
    css.setContent(cssContent);

    var distp = node_path.join(testData, 'dist.css');
    css.flush(distp, function() {
      var css = new CSS(distp);
      expect(css.getContent()).to.deep.equal(cssContent);
      fs.unlinkSync(distp);
      done();
    });
  });
});
