/**
 * A data structure to efficiently find configuration for a given resource
 * @class
 * @param {Array.<ProjectConfiguration>} configurations
 */

var node_path = require('path');

function ConfigurationTrie(configurations) {
  this.root = { paths: {} };
  this.configurations = configurations;
  configurations.forEach(this.indexConfiguration, this);
}

ConfigurationTrie.fromObject = function(object) {
  var ProjectConfiguration = require('./resource/ProjectConfiguration');
  return new ConfigurationTrie(object.map(function(r) {
    return ProjectConfiguration.fromObject(r);
  }));
};

ConfigurationTrie.prototype.toObject = function() {
  return this.configurations.map(function(r) {
    return r.toObject();
  });
};

/**
 * @protected
 */
ConfigurationTrie.prototype.indexConfiguration = function(configuration) {
  configuration.getHasteRoots().forEach(function(path) {
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

ConfigurationTrie.prototype.findConfiguration = function(resourcePath) {
  var parts = resourcePath.split(node_path.sep);
  var node = this.root;
  var configuration;
  for (var i = 0; i < parts.length - 1; i++) {
    var part = parts[i];
    if (node.paths[part]) {
      node = node.paths[part];
      configuration = node.configuration || configuration;
    } else {
      break;
    }
  }
  return configuration;
};

module.exports = ConfigurationTrie;
