/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file FileFinder功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('getFinder', function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var getFinder = require('../lib/getFinder');
  var workingDir = node_path.join(__dirname, '..', '__test_data__', 'FileFinder');

  it('should find files in a directory using find method', function(done) {
    var finder = getFinder(
      [workingDir],
      ['.js'],
      null,
      true
    );

    finder.find(function(files) {
      files = files.map(function(r) {
        return r[0];
      });
      expect(files.join('\n')).to.contain(node_path.join('sub','1.js'));
      expect(files.join('\n')).to.contain(node_path.join('sub','2.js'));
      expect(files.join('\n')).to.contain('3.js');

      done();
    });
  });

  it('should find files in a directory using getFinder static method',
    function(done) {
      getFinder().findInNode([workingDir], ['.js'], null, function(files) {
        files = files.map(function(r) {
          return r[0];
        });
        expect(files.join('\n')).to.contain(node_path.join('sub','1.js'));
        expect(files.join('\n')).to.contain(node_path.join('sub','2.js'));
        expect(files.join('\n')).to.contain('3.js');

        done();
      });
    });

  it('should find files in a directory using native find', function(done) {
    getFinder().findInNative([workingDir], ['.js'], null, function(files) {
      files = files.map(function(r) {
        return r[0];
      });
      expect(files.join('\n')).to.contain(node_path.join('sub','2.js'));
      expect(files.join('\n')).to.contain(node_path.join('sub','2.js'));
      expect(files.join('\n')).to.contain('3.js');

      done();
    });
  });
});