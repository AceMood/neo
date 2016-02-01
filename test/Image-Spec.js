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
 * @file Image资源功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('Image Resource', function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var fs = require('fs');
  var Image = require('../lib/resource/Image');

  var testData = node_path.join(__dirname, '..', '__test_data__', 'Image');
  var constData =
    'data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAA' +
    'gAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QM' +
    'taHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hw' +
    'YWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIe' +
    'nJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOn' +
    'g9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSB' +
    'YTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIv' +
    'MDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGI' +
    'HhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS' +
    '8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3J' +
    'pcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0' +
    'cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6e' +
    'G1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC' +
    '9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmU' +
    'uY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4' +
    'bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDU' +
    'zYgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9In' +
    'htcC5paWQ6OUY2MEM0NjlBQzZEMTFFNTlDRkJCNDFFNjB' +
    'DQkVDMEQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6' +
    'OUY2MEM0NkFBQzZEMTFFNTlDRkJCNDFFNjBDQkVDMEQiP' +
    'iA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2' +
    'VJRD0ieG1wLmlpZDo5RjYwQzQ2N0FDNkQxMUU1OUNGQkI' +
    '0MUU2MENCRUMwRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1w' +
    'LmRpZDo5RjYwQzQ2OEFDNkQxMUU1OUNGQkI0MUU2MENCR' +
    'UMwRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6Uk' +
    'RGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI' +
    '/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAYEBAQFBAYFBQYJ' +
    'BgUGCQsIBgYICwwKCgsKCgwQDAwMDAwMEAwODxAPDgwTE' +
    'xQUExMcGxsbHB8fHx8fHx8fHx8BBwcHDQwNGBAQGBoVER' +
    'UaHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8' +
    'fHx8fHx8fHx8fHx8fHx8fH//AABEIAGQAZAMBEQACEQED' +
    'EQH/xABLAAEBAAAAAAAAAAAAAAAAAAAACAEBAAAAAAAAA' +
    'AAAAAAAAAAAABABAAAAAAAAAAAAAAAAAAAAABEBAAAAAA' +
    'AAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AqkAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
    'AAAAAAAAAAAAAAAAAAAAAAAAH/2Q==';

  it('should have a Image type', function() {
    var img = new Image('a.png');
    expect(img.type).to.equal('Image');
  });

  it('should have a relative path', function() {
    var img = new Image('a.png');
    expect(img.path).to.deep.equal('a.png');
  });

  it('should have a null id', function() {
    var img = new Image('a.png');
    expect(img.id).to.be.null;
  });

  it('should can retrieve file content', function() {
    var img = new Image(node_path.join(testData, 'empty.jpg'));
    expect(img.getContent('base64')).to.deep.equal(constData.split(',')[1]);
  });

  xit('should can set file content', function() {
    var img = new Image(node_path.join(testData, 'empty.jpg'));
    img.setContent('');
    expect(img.getContent()).to.deep.equal('');
    img.setContent(constData);
  });

  it('should can get content with diff encoding', function() {
    var img = new Image(node_path.join(testData, 'empty.jpg'));
    expect(img.getContent('utf8')).to.not.equal(constData);
    expect(img.getContent('base64')).to.deep.equal(constData.split(',')[1]);
  });

  it('should flush content to destination', function(done) {
    var img = new Image(node_path.join(testData, 'empty.jpg'));
    var distp = node_path.join(testData, 'dist.jpg');
    img.flush(distp, function() {
      var img = new Image(distp);
      expect(img.getContent('base64')).to.deep.equal(constData.split(',')[1]);
      fs.unlinkSync(distp);
      done();
    });
  });
});
