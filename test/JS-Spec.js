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
 * @file JS资源功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */
/* globals expect */

describe('JS Resource', function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var fs = require('fs');
  var JS = require('../lib/resource/JS');

  var testData = node_path.join(__dirname, '..', '__test_data__', 'JS');

  it('should have a JS type', function() {
    var js = new JS('a');
    expect(js.type).to.equal('JS');
  });

  it('should have a relative path', function() {
    var js = new JS('a');
    expect(js.path).to.deep.equal('a');
  });

  it('should have a null id', function() {
    var js = new JS('a');
    expect(js.id).to.be.null;
  });

  it('should can retrieve file content', function() {
    var js = new JS(node_path.join(testData, 'empty.js'));
    expect(js.getContent()).to.deep.equal('');
    js = new JS(node_path.join(testData, 'plain.js'));
    expect(js.getContent()).to.deep.equal('var str = \'Hello World\';');
  });

  it('should can set file content', function() {
    var cssContent = 'html, body { border: 0 }';
    var js = new JS(node_path.join(testData, 'empty.js'));
    js.setContent(cssContent);
    expect(js.getContent()).to.deep.equal(cssContent);
    js.setContent('');
    expect(js.getContent()).to.deep.equal('');
  });

  it('should flush content to destination', function(done) {
    var js = new JS(node_path.join(testData, 'empty.js'));
    var cssContent = 'var str = \'Hello World\';';
    js.setContent(cssContent);

    var distp = node_path.join(testData, 'dist.js');
    js.flush(distp, function() {
      var js = new JS(distp);
      expect(js.getContent()).to.deep.equal(cssContent);
      fs.unlinkSync(distp);
      done();
    });
  });
});
