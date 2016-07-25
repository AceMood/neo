/**
 * @file 字典树Trie
 */

'use strict';

const node_path = require('path');

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
 * @param   {object} object
 * @returns {ConfigurationTrie}
 */
ConfigurationTrie.fromObject = function(object) {
  let ProjectConfiguration = require('./resource/ProjectConfiguration');
  return new ConfigurationTrie(object.map(r => {
    ProjectConfiguration.fromObject(r);
  }));
};

/**
 * 转化成对象
 * @returns {Array}
 */
ConfigurationTrie.prototype.toObject = function() {
  return this.configurations.map(r => r.toObject());
};

/**
 * @protected
 * @param {ProjectConfiguration} configuration
 */
ConfigurationTrie.prototype.indexConfiguration = function(configuration) {
  configuration.getRoots().forEach(function(path) {
    // 分解路径
    let parts = path.split(node_path.sep);
    let node = this.root;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      node.paths[part] = node.paths[part] || { paths: {} };
      node = node.paths[part];
    }
    node.configuration = configuration;
  }, this);
};

/**
 * 根据资源路径找到对应的configuration对象
 * @param {string} resourcePath
 * @returns {?ProjectConfiguration}
 */
ConfigurationTrie.prototype.findConfiguration = function(resourcePath) {
  let parts = resourcePath.split(node_path.sep);
  let node = this.root;
  let configuration;
  for (let i = 0; i < parts.length - 1; i++) {
    let part = parts[i];
    if (node.paths[part]) {
      node = node.paths[part];
      configuration = node.configuration;
    } else {
      break;
    }
  }
  return configuration;
};

module.exports = ConfigurationTrie;