/**
 * @fileoverview
 */

var inherits = require('util').inherits;
var path = require('path');
var ProjectConfiguration = require('../resource/ProjectConfiguration');
var ResourceLoader = require('./ResourceLoader');

/**
 * @class Loads and parses package.json files
 *
 * @extends {ResourceLoader}
 */
function ProjectConfigurationLoader() {
  ResourceLoader.call(this);
}

inherits(ProjectConfigurationLoader, ResourceLoader);

ProjectConfigurationLoader.prototype.path = __filename;

ProjectConfigurationLoader.prototype.isConfiguration = true;

ProjectConfigurationLoader.prototype.getResourceTypes = function() {
  return [ProjectConfiguration];
};

ProjectConfigurationLoader.prototype.getExtensions = function() {
  return ['.json'];
};

/**
 * Initialize a resource with the source code and configuration
 * Loader can parse, gzip, minify the source code to build the resulting
 * Resource value object
 *
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {String}               sourceCode
 * @param {Function}             callback
 */
ProjectConfigurationLoader.prototype.loadFromSource =
  function(path, configuration, sourceCode, messages, callback) {
    var config = new ProjectConfiguration(path);
    config.id = path;
    try {
      config.data = sourceCode !== '' ? JSON.parse(sourceCode) : {};
    } catch (e) {
      console.error("Error parsing `" + path + "`!");
      throw e;
    }
    callback(messages, config);
  };

/**
 * Only match package.json files
 * @param  {String} filePath
 * @return {Boolean}
 */
ProjectConfigurationLoader.prototype.matchPath = function(filePath) {
  return path.basename(filePath) === 'package.json';
};

// 导出
module.exports = ProjectConfigurationLoader;