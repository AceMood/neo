/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 资源头注释中的指令
 * @author AceMood
 */

'use strict';

const spaceRe = /\s+/;

const Directives = {
  provides: function(value, resource) {
    resource.id = value.split(spaceRe)[0];
  },
  module: function(value, resource) {
    if (resource.type === 'js') {
      resource.isModule = true;
    }
  },
  entry: function(value, resource) {
    if (resource.type === 'js') {
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