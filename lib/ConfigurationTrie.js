/**
 * @file 字典树Trie
 */

'use strict';

var node_path = require('path');

/**
 * 一个能高效寻找给定资源相关的配置文件的数据结构.
 * @constructor
 * @param {Array.<ProjectConfiguration>} configurations 配置对象数组
 */
function ConfigurationTrie(configurations) {
  this.root = { paths: {} };
  this.configurations = configurations;
  configurations.forEach(this.indexConfiguration, this);
}

/**
 * 由对象生成资源实例
 * @param {Object} object
 * @returns {ConfigurationTrie}
 */
ConfigurationTrie.fromObject = function(object) {
  var ProjectConfiguration = require('./resource/ProjectConfiguration');
  return new ConfigurationTrie(object.map(function(r) {
    return ProjectConfiguration.fromObject(r);
  }));
};

/**
 * 转化成对象
 * @returns {Array}
 */
ConfigurationTrie.prototype.toObject = function() {
  return this.configurations.map(function(r) {
    return r.toObject();
  });
};

/**
 * @protected
 * @param {ProjectConfiguration} configuration
 */
ConfigurationTrie.prototype.indexConfiguration = function(configuration) {
  configuration.getRoots().forEach(function(path) {
    // 分解路径
    var parts = path.split(node_path.sep);
    var node = this.root;
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      node.paths[part] = node.paths[part] || { paths: {} };
      node = node.paths[part];
    }
    node.configuration = configuration;
  }, this);
};

/**
 * 根据资源路径找到对应的configuration对象
 * @param {String} resourcePath
 * @returns {?ProjectConfiguration}
 */
ConfigurationTrie.prototype.findConfiguration = function(resourcePath) {
  var parts = resourcePath.split(node_path.sep);
  var node = this.root;
  var configuration;
  for (var i = 0; i < parts.length - 1; i++) {
    var part = parts[i];
    if (node.paths[part]) {
      node = node.paths[part];
      configuration = node.configuration;
    } else {
      break;
    }
  }
  return configuration;
};

// 导出
module.exports = ConfigurationTrie;