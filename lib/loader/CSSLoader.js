/**
 * @fileoverview 加载css资源
 */

'use strict';

var inherits = require('util').inherits;
var zlib = require('zlib');

var docblock = require('../parse/docblock');
var ResourceLoader = require('./ResourceLoader');
var extractFBSprites = require('../parse/css').extractFBSprites;
var CSS = require('../resource/CSS');
var MessageList = require('../MessageList');

/**
 * 加载解析css文件. 从头部注释中解析选项, 计算gzip大小. 默认不计算可以通过配置开启.
 * @constructor
 * @extends {ResourceLoader}
 * @param {Object|null} options Object with the following options:
 *                              - extractNetworkSize
 *                              - extractFBSprites
 */
function CSSLoader(options) {
  ResourceLoader.call(this, options);
  var extractNetworkSize = !!this.options.networkSize;

  if (extractNetworkSize) {
    this.extractExtra = this.extractNetworkSize;
  } else {
    this.extractExtra = function(css, sourceCode, messages, callback) {
      // make async to break long stack traces
      process.nextTick(function() {
        callback(messages, css);
      });
    };
  }
}

inherits(CSSLoader, ResourceLoader);

CSSLoader.prototype.path = __filename;

CSSLoader.prototype.getResourceTypes = function() {
  return [CSS];
};

CSSLoader.prototype.getExtensions = function() {
  return ['.css'];
};

/**
 * 计算近似的gziping文件大小. 默认关闭计算
 * @todo (voloko) why not minify?
 * Off by default due to perf cost
 *
 * @protected
 * @param {CSS}   css
 * @param {String}   sourceCode
 * @param {MessageList} messages
 * @param {Function} callback
 */
CSSLoader.prototype.extractNetworkSize =
  function(css, sourceCode, messages, callback) {
    zlib.deflate(sourceCode, function(err, buffer) {
      css.networkSize = buffer.length;
      callback(messages, css);
    });
  };

/**
 * 利用源码中的信息初始化一个资源.
 * Loader可以解析, gzip, 压缩源码 to build the resulting
 * Resource value object
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {String}               sourceCode
 * @param {MessageList}          messages
 * @param {Function}             callback
 */
CSSLoader.prototype.loadFromSource =
  function(path, configuration, sourceCode, messages, callback) {
    var css = new CSS(path);
    // 解析源码信息
    var props = docblock.parse(docblock.extract(sourceCode));
    props.forEach(function(pair) {
      var name = pair[0];
      var value = pair[1];

      switch(name) {
        case 'provides':
          css.id = value;
          break;
        case 'providesModule':
          css.isModule = true;
          css.id = 'css:' + value;
          break;
        // 依赖模块, todo 摒弃css原生的import指令?
        case 'css':
          value.split(/\s+/).forEach(css.addRequiredCSS, css);
          break;
        case 'nonblocking':
          css.isNonblocking = true;
          break;
        case 'nopackage':
          css.isNopackage = true;
          break;
        case 'options':
          value.split(/\s+/).forEach(function(key) {
            css.options[key] = true;
          });
          break;
        case 'author':
        case 'deprecated':
        case 'file':
        case 'fileoverview':
        case 'email':
        case 'nolint':
          // Support these so Diviner can pick them up.
          // various options
          break;
        default:
          messages.addClowntownError(css.path, 'docblock',
            'Unknown directive ' + name);
      }
    });

    // todo
    if (this.options.extractFBSprites) {
      css.fbSprites = extractFBSprites(sourceCode);
    }

    // 计算依赖模块
    css.finalize();

    this.extractExtra(css, sourceCode, messages, callback);
  };

/**
 * 匹配*.css文件
 * @param  {String} filePath
 * @return {Boolean}
 */
CSSLoader.prototype.matchPath = function(filePath) {
  return filePath.lastIndexOf('.css') === filePath.length - 4;
};

/**
 * Post process is called after the map is updated but before the update
 * task is complete.
 * Used to resolve local required paths and /index.js directory requires
 *
 * @param  {ResourceMap}      map
 * @param  {Array.<Resource>} resources
 * @param  {Function}         callback
 */
CSSLoader.prototype.postProcess = function(map, resources, callback) {
  var messages = MessageList.create();

  resources.forEach(function(r) {
    var resource, i, required;

    required = r.requiredCSS;
    for (i = 0; i < required.length; i++) {
      resource = map.getResource('CSS', 'css:' + required[i]);
      if (resource && resource.isModule) {
        required[i] = 'css:' + required[i];
      }
    }
  });

  process.nextTick(function() {
    callback(messages);
  });
};

// 导出
module.exports = CSSLoader;