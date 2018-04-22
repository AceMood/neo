/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file FileFinder功能测试
 * @author AceMood
 */

/* globals describe */
/* globals it */

describe('Finder', function() {

  var expect = require('chai').expect;
  var node_path = require('path');
  var getFinder = require('./core/Finder');
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