/**
 * @file 加载css资源
 */

'use strict';

var inherits = require('util').inherits;
var zlib = require('zlib');

var docblock = require('../parser/docblock');
var ResourceLoader = require('./ResourceLoader');
var cssParser = require('../parser/cssParser');
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
  return ['.css', '.less', '.scss'];
};

var spaceRe = /\s+/;

/**
 * 解析注释头
 * @protected
 * @param {CSS} css
 * @param {String} sourceCode
 * @param {MessageList} messages
 */
CSSLoader.prototype.parseDocblock =
    function(css, sourceCode, messages) {
      var props = docblock.parse(docblock.extract(sourceCode));
      props.forEach(function(pair) {
        var name = pair[0];
        var value = pair[1];

        switch (name) {
          case 'provides':
            css.id = value.split(spaceRe)[0];
            break;
          case 'css':
            value.split(spaceRe).forEach(css.addRequiredCSS, css);
            break;
          case 'nonblocking':
            css.isNonblocking = true;
            break;
          case 'nopackage':
            css.isNopackage = true;
            break;
          case 'option':
          case 'options':
          case 'author':
          case 'deprecated':
          case 'file':
          case 'fileoverview':
          case 'email':
          case 'emails':
          case 'nolint':
            // Support these so Diviner can pick them up.
            // various options
            break;
          case 'requires':
          case 'providesModule':
          case 'module':
            // various options
            messages.addWarning(css.path, 'docblock',
                "File has a header docblock, but the docblock is class or " +
                "function documentation, not file documentation. Header blocks " +
                "@requires, @module, and so on have been deprecated!");
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

      // 解析sprite
      if (this.options.extractSprites) {
        cssParser.extractSprites(sourceCode).forEach(css.addSprite, css);
      }

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
  return this.getExtensions().some(function(ext) {
    return filePath.lastIndexOf(ext) === filePath.length - ext.length;
  });
};

/**
 * Resolving the absolute file path for a `require(x)` call is actually nuanced
 * and difficult to reimplement. Instead, we'll use an implementation based on
 * node's (private) path resolution to ensure that we're compliant with
 * commonJS. This doesn't take into account `providesModule`, so we deal with
 * that separately.  Unfortunately, node's implementation will read files off of
 * the disk that we've likely already pulled in `ProjectConfigurationLoader`
 * etc, so we can't use it directly - we had to factor out the pure logic into
 * `PathResolver.js`.
 *
 * @param {string} requiredText ｀require()`调用的参数.
 * @param {string} callersPath 发起`require()`调用模块的的路径.
 * @param {ResourceMap} resourceMap ResourceMap containing project configs and
 * JS resources.
 * @return {string} Absolute path of the file corresponding to requiredText, or
 * null if the module can't be resolved.
 */
function findAbsolutePathForRequired(requiredText, callersPath, resourceMap) {
  var callerData = {
    id: callersPath,
    paths: resourceMap.getAllInferredProjectPaths(),
    fileName: callersPath
  };
  // debugger;
  return PathResolver._resolveFileName(requiredText, callerData, resourceMap);
}

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

  // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的, 而不论调用require
  // 的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID. 否则话调用
  // `findAbsolutePathForRequired`方法查找路径.
  // 这个缓存只对非相对路径('.'开头)有效.
  var nonRelativePathCache = {};

  resources.forEach(function(r) {
    var required = r.requiredCSS;
    var resource, i;
    for (i = 0; i < required.length; i++) {
      var requiredText = required[i];
      resource = map.getResource('CSS', requiredText);
      // Already requiring by ID - no static resolution needed.
      if (resource) {
        continue;
      }

      // @module and standard require('projectName/path/to.js') would
      // have been caught above - now handle commonJS relative dirs, and
      // package.json main files.
      var beginsWithDot = requiredText.charAt(0) !== '.';
      var textInCache = requiredText in nonRelativePathCache;
      var commonJSResolvedPath = beginsWithDot && textInCache ?
          nonRelativePathCache[requiredText] :
          findAbsolutePathForRequired(requiredText, r.path, map);

      // 缓存
      if (beginsWithDot && !textInCache) {
        nonRelativePathCache[requiredText] = commonJSResolvedPath;
      }

      // If not found by ID, we use commonJS conventions for lookup.
      var resolvedResource =
          commonJSResolvedPath &&
          map.getResourceByPath(commonJSResolvedPath);

      // Some modules may not have ids - this is likely a bug - their package's
      // haste roots might be incorrect.
      if (resolvedResource && resolvedResource.id) {
        if (resolvedResource.id !== required[i]) {
          // 'JSTest' files end up here. They don't have this method.
          if (r.recordRequiredModuleOrigin) {
            r.recordRequiredModuleOrigin(required[i], resolvedResource.id);
            required[i] = resolvedResource.id;
          }
        }
      }
    }
  });

  callback(messages);
};

// 导出
module.exports = CSSLoader;