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
 * @file 资源头注释中的指令
 * @author AceMood
 */

'use strict';

const spaceRe = /\s+/;

const Directives = {
  provides: function(value, resource) {
    if (resource.type === 'JS') {
      resource.id = value.split(spaceRe)[0];
    }
  },
  module: function(value, resource) {
    if (resource.type === 'JS') {
      resource.isModule = true;
    }
  },
  entry: function(value, resource) {
    if (resource.type === 'JS') {
      resource.isEntryPoint = true;
    }
  },
  css: function(value, resource) {
    value.split(spaceRe).forEach(resource.addRequiredCSS, resource);
  },
  nopackage: function(value, resource) {
    resource.isNopackage = true;
  },
  nonblocking: function(value, resource) {
    resource.isNonblocking = true;
  },
  permanent: function(value, resource) {
    resource.isPermanent = true;
  },
  requires: function() {},
  file: function() {},
  author: function() {},
  email: function() {}
};

/**
 * 根据不同指令操作不同资源对象
 * @param   {string} name
 * @param   {string} value
 * @param   {Resource} resource
 * @returns {boolean}
 */
const assign = function(name, value, resource) {
  if (Directives[name]) {
    Directives[name](value, resource);
    return true;
  }
  return false;
};

exports.assign = assign;