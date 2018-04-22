/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file CSS资源功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('CSS Resource', function () {

  var expect = require('chai').expect;
  var node_path = require('path');
  var fs = require('fs');
  var CSS = require('./resource/CSS');

  var testData = node_path.join(__dirname, '..', '__test_data__', 'CSS');

  it('should have a css type', function () {
    var css = new CSS('a');
    expect(css.type).to.equal('css');
  });

  it('should have a relative path', function () {
    var css = new CSS('a');
    expect(css.path).to.deep.equal('a');
  });

  it('should have a null id', function () {
    var css = new CSS('a');
    expect(css.id).to.be.null;
  });

  it('should can retrieve file content', function () {
    var css = new CSS(node_path.join(testData, 'empty.css'));
    expect(css.getContent()).to.deep.equal('');
    css = new CSS(node_path.join(testData, 'onerule.css'));
    expect(css.getContent()).to.deep.equal('div { font-size: 12em }');
  });

  it('should can set file content', function () {
    var cssContent = 'html, body { border: 0 }';
    var css = new CSS(node_path.join(testData, 'empty.css'));
    css.setContent(cssContent);
    expect(css.getContent()).to.deep.equal(cssContent);
    css.setContent('');
    expect(css.getContent()).to.deep.equal('');
  });

  it('should flush content to destination', function (done) {
    var css = new CSS(node_path.join(testData, 'empty.css'));
    var cssContent = 'html, body { border: 0 }';
    css.setContent(cssContent);

    var distp = node_path.join(testData, 'dist.css');
    css.flush(distp, function () {
      var css = new CSS(distp);
      expect(css.getContent()).to.deep.equal(cssContent);
      fs.unlinkSync(distp);
      done();
    });
  });
});

//# sourceMappingURL=CSS-Spec-compiled.js.map