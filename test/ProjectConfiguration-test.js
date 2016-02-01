/**
 * @file ProjectConfiguration资源功能测试
 */

/* globals describe */
/* globals it */
/* globals expect */

describe('ProjectConfiguration', function() {

  var path = require('path');
  var ProjectConfiguration = require('../lib/resource/ProjectConfiguration');

  it('should return non-haste affecteded roots', function() {
    var resource = new ProjectConfiguration('a/b/package.json', {});
    expect(resource.getRoots()).toEqual([path.join('a','b')]);
  });

  it('should return affecteded roots', function() {
    var resource = new ProjectConfiguration(
      'a/b/package.json',
      { roots: ['lib', 'tests']});
    expect(resource.getRoots())
        .toEqual([path.join('a','b','lib'), path.join('a','b','tests')]);
  });

  it('should resolve id with a prefix', function() {
    var resource = new ProjectConfiguration(
      'a/b/package.json',
      {
        roots: ['lib', 'tests'],
        namespace: "bar"
      });
    expect(resource.resolveID(path.join('a','b','lib','foo')))
        .toEqual(path.join('bar','foo'));
  });

  it('should resolve id without a prefix', function() {
    var resource = new ProjectConfiguration(
      'a/b/package.json',
      {
        roots: ['lib', 'tests'],
        namespace: ''
      });
    expect(resource.resolveID(path.join('a','b','lib','foo'))).toEqual('foo');
  });

});
