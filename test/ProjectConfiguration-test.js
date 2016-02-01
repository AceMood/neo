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
 * @file ProjectConfiguration资源功能测试
 */

/* globals describe */
/* globals it */

describe('ProjectConfiguration', function() {

  var expect = require('chai').expect;
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
