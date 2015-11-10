/**
 * @file 加载css资源
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var zlib = require('zlib');

var docblock = require('../parser/docblock');
var ResourceLoader = require('./ResourceLoader');
// var cssParser = require('../parser/cssParser');
var CSS = require('../resource/CSS');
var MessageList = require('../MessageList');

/**
 * 加载解析css文件. 从头部注释中解析选项, 计算gzip大小. 默认不计算可以通过配置开启.
 * @constructor
 * @extends {ResourceLoader}
 * @param {Object|null} options Object with the following options:
 *                              - extractNetworkSize
 *                              - extractSprites
 */
function CSSLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(CSSLoader, ResourceLoader);
CSSLoader.__proto__ = ResourceLoader;

CSSLoader.prototype.path = __filename;

/**
 * 返回加载器可加载的资源类型
 * @returns {Array.<Resource>}
 */
CSSLoader.prototype.getResourceTypes = function() {
  return [CSS];
};

/**
 * 返回可加载资源类型对应的后缀名
 * @returns {Array.<String>}
 */
CSSLoader.prototype.getExtensions = function() {
  return ['.css'];
};

var spaceRe = /\s+/;

/**
 * 解析注释头
 * @protected
 * @param {CSS}      css
 * @param {String}   sourceCode
 * @param {MessageList} messages
 */
CSSLoader.prototype.parseDocblock =
    function(css, sourceCode, messages) {
      var props = docblock.parse(docblock.extract(sourceCode));
      props.forEach(function(pair) {
        var name = pair[0];
        var value = pair[1];

        switch (name) {
          case 'css':
            value.split(spaceRe).forEach(css.addRequiredCSS, css);
            break;
          case 'nonblocking':
            css.isNonblocking = true;
            break;
          case 'nopackage':
            css.isNopackage = true;
            break;
          case 'options':
            value.split(spaceRe).forEach(function(key) {
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
          case 'requires':
          case 'provides':
          case 'providesModule':
          case 'module':
            // various options
            messages.addWarning(css.path, 'docblock',
                "File has a header docblock, but the docblock is class or " +
                "function documentation, not file documentation. Header blocks " +
                "@requires, @provides, @providesModule, @module, and so on have been deprecated!");
            break;
          default:
            messages.addClowntownError(css.path, 'docblock',
                'Unknown directive ' + name);
        }
      });
    };

/**
 * 利用源码中的信息初始化一个资源.
 * Loader可以解析, gzip, 压缩源码以得到最终的Resource object.
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

      this.parseDocblock(css, sourceCode, messages);

      if (configuration && !css.id) {
        css.id = configuration.resolveID(css.path);
      }

      // 解析依赖css文件
      /*
      var dependencies = cssParser.retrieve(sourceCode);
      if (dependencies.sprites.length) {
        css.sprites = dependencies.sprites;
      }*/

      css.finalize();

      // 是否计算网络传输
      if (!!this.options.networkSize) {
        zlib.deflate(sourceCode, function(err, buffer) {
          css.networkSize = buffer.length;
          callback(messages, css);
        });
      } else {
        callback(messages, css);
      }
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
 * Post process发生在资源表更新之后, 但是在升级任务完成前.
 * Used to resolve local required paths and /index.js directory requires
 *
 * @param  {ResourceMap}      map
 * @param  {Array.<Resource>} resources
 * @param  {Function}         callback
 */
CSSLoader.prototype.postProcess = function(map, resources, callback) {
  var messages = MessageList.create();

  var inferredProjectPaths = map.inferredProjectPaths[0];

  // todo 更改为依赖css文件的id
  resources.forEach(function(r) {
    var resource, i, required;
    required = r.requiredCSS;

    var rp = node_path.join(inferredProjectPaths, r.path);


    for (i = 0; i < required.length; i++) {
      var realpath = node_path.resolve(rp, required[i]);
      var rel = node_path.relative(inferredProjectPaths, realpath);
      debugger;
      resource = map.getResourceByPath(rel);
      if (resource) {
        required[i] = resource.id;
      } else {
        // todo
      }
    }
  });

  callback(messages);
};

// 导出
module.exports = CSSLoader;