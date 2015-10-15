

'use strict';

var path = require('path');
var fs = require('fs');
var utils = require('../utils');

/**
 * 单个资源基类
 * @constructor
 */
function ResourceBase (config) {
  this.type = config.type;
  this.encoding = config.encoding;
  // 针对两个虚拟目录vrd和drd的绝对路径
  this.from = this.key = config.from;
  this.to = config.to;
  // 系统中的真实绝对路径
  // 会因打包系统而不同
  this.original = config.original;
  this.dist = config.dist;
  // 根据资源内容生成的唯一名
  this.hashId = '';
  // 资源表中用于定位的短资源名
  this.sid = '';
}

ResourceBase.prototype.mtime = 0;

/**
 * @override
 * @returns {String}
 */
ResourceBase.prototype.toString = function () {
  return 'This Resource instance is a ' + this.type + ' resource.' +
    '\nIts key is ' + this.key + ', to be resolved in encoding ' +
    this.encoding + '.' + '\nAnd its final absolute path is: ' + this.to;
};

/** @abstract */
ResourceBase.prototype.getHashId = function() {
  throw 'resource.getHashId method must be implemented by subclass.';
};

/**
 * 序列化成对象
 * @return {Object}
 */
ResourceBase.prototype.toObject = function() {
  var object = { type: this.type };
  for (var i in this) {
    if (i.charAt(0) !== '_' && this.hasOwnProperty(i)) {
      object[i] = this[i];
    }
  }
  return object;
};

/**
 * 由对象创建资源
 * @param  {Object} object
 * @return {ResourceBase}
 */
ResourceBase.fromObject = function(object) {
  var instance = new ResourceBase(object.path);
  for (var i in object) {
    instance[i] = object[i];
  }
  return instance;
};

// 导出
module.exports = ResourceBase;