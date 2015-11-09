/**
 * @file ResourceLoader基类.
 */

var fs = require('fs');
var Resource = require('../resource/Resource');
var MessageList = require('../MessageList');

/**
 * ResourceLoader和MapUpdateTask一起研究不同的资源类型.
 * 每一个loader类型可以加载一种或多种资源. 每个loader可以接受一些选项配置加载过程.
 * loader默认会读取文件内容解析代码提取出有用的信息.
 */
function ResourceLoader(options) {
  this.options = options || {};
}

ResourceLoader.prototype.path = __filename;

/**
 * @param {Object} object
 * @returns {C}
 */
ResourceLoader.fromObject = function(object) {
  var C = require(object.path);
  return new C(object.options);
};

/**
 * @returns {{path: *, options: *}}
 */
ResourceLoader.prototype.toObject = function() {
  return {
    path: this.path,
    options: this.options
  };
};

/**
 * @override
 * @returns {Array}
 */
ResourceLoader.prototype.getResourceTypes = function() {
  return [Resource];
};

/**
 * @override
 * @returns {Array}
 */
ResourceLoader.prototype.getExtensions = function() {
  return [];
};

/**
 * Creates a new resource for a given path. Can be overridden in a sublcass
 * to perform different loading
 *
 * @param  {String} path 资源路径
 * @param  {ProjectConfiguration} configuration
 * @param  {Function} callback 回调函数
 */
ResourceLoader.prototype.loadFromPath = function(path, configuration, callback) {
  var me = this;
  var messages = MessageList.create();

  fs.readFile(path, 'utf-8', function(err, sourceCode) {
    if (err) {
      console.error('Error reading file: `' + path + '`');
      throw err;
    } else {
      me.loadFromSource(
        path,
        configuration,
        sourceCode || '',
        messages,
        callback);
    }
  });
};

/**
 * Initialize a resource with the source code and configuration
 * Loader can parse, gzip, minify the source code to build the resulting
 * Resource value object
 *
 * TODO: @jordwalke: Actually cache the file contents here so that future
 * packaging stages can read the cached file!
 *
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {String}               sourceCode
 * @param {MessageList}          messages
 * @param {Function}             callback
 */
ResourceLoader.prototype.loadFromSource =
    function(path, configuration, sourceCode, messages, callback) {
      var resource = new Resource(path);
      callback(messages, resource);
    };

/**
 * 检查是否可以解析指定路径的资源. Map builder will match
 * all available resource types to find the one that can parse the given path
 * 基类永远返回true, 因为有可能解析任何类型的文件
 * @static
 * @param  {String} path
 * @return {Boolean}
 */
ResourceLoader.prototype.matchPath = function(path) {
  return true;
};

/**
 * 资源加载器的后处理发生在资源表升级后, 但是升级任务完成前.
 * Can be used to resolve dependencies or to bulk process all loaded resources
 * @param  {ResourceMap}      map
 * @param  {Array.<Resource>} resources
 * @param  {Function}         callback
 */
ResourceLoader.prototype.postProcess = function(map, resources, callback) {
  callback(MessageList.create());
};

// 导出
module.exports = ResourceLoader;