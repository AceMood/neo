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
 * @file 资源表对象测试用例
 * @author AceMood
 * @email zmike86@gmail.com
 */

describe('ResourceMap', function() {

  var expect = require('chai').expect;
  var ResourceMap = require('../lib/map/ResourceMap');
  var Resource = require('../lib/resource/Resource');
  var ProjectConfiguration = require('../lib/resource/ProjectConfiguration');

  it('should intialize from a list', function() {
    var a, b;
    var map = new ResourceMap([
      a = new Resource('a'),
      b = new Resource('b')
    ]);

    expect(map.getResource('Resource', 'a')).to.deep.equal(a);
    expect(map.getResource('Resource', 'b')).to.deep.equal(b);
    expect(map.getResource('Resource', 'c')).to.be.undefined;
    expect(map.getAllResources()).to.deep.equal([a, b]);
  });

  it('should return elements from empty map', function() {
    var map = new ResourceMap([]);
    expect(map.getResource('JS', 'a')).to.be.undefined;
  });

  it('should add elements', function() {
    var a, b;
    var map = new ResourceMap([
      a = new Resource('a')
    ]);
    map.addResource(b = new Resource('b'));

    expect(map.getResource('Resource', 'b')).to.deep.equal(b);
    expect(map.getAllResources()).to.deep.equal([a, b]);
  });

  it('should update elements', function() {
    var a1, a2;
    var map = new ResourceMap([
      a1 = new Resource('a')
    ]);
    map.updateResource(a1, a2 = new Resource('a'));

    expect(map.getResource('Resource', 'a')).to.deep.equal(a2);
  });

  it('should remove elements', function() {
    var a, b;
    var map = new ResourceMap([
      a = new Resource('a'),
      b = new Resource('b')
    ]);
    map.removeResource(b);
    expect(map.getResource('Resource', 'b')).to.be.undefined;
    expect(map.getAllResources()).to.deep.equal([a]);
    expect(map.getAllResourcesByType('Resource')).to.deep.equal([a]);
  });

  it('should get all resources by type', function() {
    var a, b, pa, pb;
    var map = new ResourceMap([
      a = new Resource('a'),
      b = new Resource('b'),
      pa = new ProjectConfiguration('pa.json'),
      pb = new ProjectConfiguration('pb.json')
    ]);
    expect(map.getAllResourcesByType('ProjectConfiguration')).to.deep.equal([pa, pb]);
    expect(map.getAllResourcesByType('Resource')).to.deep.equal([a, b]);
  });

  it('should get all resources by type', function() {
    var a, b, pa, pb;
    var map = new ResourceMap([
      a = new Resource('a/a.js'),
      b = new Resource('b/b.js'),
      pa = new ProjectConfiguration('a/package.json', {})
    ]);
    expect(map.getConfigurationByPath(a.path)).to.deep.equal(pa);
    pb = new ProjectConfiguration('b/package.json', {});
    map.addResource(pb);
    expect(map.getConfigurationForResource(b)).to.deep.equal(pb);
  });
});