/**
 * @file js加载器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var path = require('path');
var zlib = require('zlib');

var docblock = require('../parser/docblock');
var jsParser = require('../parser/jsParser');
var JS = require('../resource/JS');
var MessageList = require('../MessageList');
var ResourceLoader = require('./ResourceLoader');
var utils = require('../util');

/**
 * 加载并解析JavaScript files
 * @constructor
 * Loader的作用要解析源码中的document block, 计算gzip大小.
 * @extends {ResourceLoader}
 * @param {Object|null} options 选项如下:
 *                              - networkSize
 */
function JSLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(JSLoader, ResourceLoader);

// 默认路径
JSLoader.prototype.path = __filename;

// 加载器支持的资源类型
JSLoader.prototype.getResourceTypes = function() {
  return [JS];
};

// 加载器加载资源后缀名
JSLoader.prototype.getExtensions = function() {
  return this.options.extensions || ['.js'];
};

var spaceRe = /\s+/;

/**
 * 解析注释头
 * @protected
 * @param {JS}       js
 * @param {String}   sourceCode
 * @param {MessageList} messages
 */
JSLoader.prototype.parseDocblock = function(js, sourceCode, messages) {
  var props = docblock.parse(docblock.extract(sourceCode));
  var me = this;
  props.forEach(function(pair) {
    var name = pair[0];
    var value = pair[1];

    switch (name) {
      case 'provides':
        js.id = value.split(spaceRe)[0];
        break;
      case 'module':
        js.isModule = true;
        break;
      case 'css':
        value.split(spaceRe).forEach(js.addRequiredCSS, js);
        break;
      case 'requires':
        value.split(spaceRe).forEach(js.addRequiredModule, js);
        break;
      case 'nopackage':
        js.isNopackage = true;
        break;
      case 'nonblocking':
        js.isNonblocking = true;
        break;
      default:
        // various options
        messages.addWarning(js.path, 'docblock',
                'Unknown directive ' + name + ' in file ' + js.path);
    }
  });
};

/**
 * 从源码解析出最终的Resource对象.
 * @protected
 * @param {string} path      resource being built
 * @param {ProjectConfiguration} configuration 当前js文件所在工程目录下如果有package.json
 *                                             配置文件, 则传入该配置资源
 * @param {string} sourceCode js代码
 * @param {MessageList} messages
 * @param {function} callback
 */
JSLoader.prototype.loadFromSource =
    function(path, configuration, sourceCode, messages, callback) {
      var js = new JS(path);

      this.parseDocblock(js, sourceCode, messages);

      // resolve module ids through configuration
      // require calls outside of modules are not supported
      if (!js.id) {
        if (configuration) {
          js.id = configuration.resolveID(js.path);
        } else {
          js.id = js.path;
        }
      }

      // 解析依赖的同步/异步模块
      if (js.isModule) {
        jsParser
            .requireCalls(sourceCode)
            .forEach(js.addRequiredModule, js);
        jsParser
            .requireAsyncCalls(sourceCode)
            .forEach(js.addRequiredAsyncModule, js);
      }

      js.finalize();

      // 附带上文件内容
      js.setContent(sourceCode);

      // call generated function
      if (!!this.options.networkSize) {
        zlib.gzip(sourceCode, function(err, buffer) {
          js.networkSize = buffer.length;
          callback(messages, js);
        });
      } else {
        callback(messages, js);
      }
    };

/**
 * 匹配 *.js
 * @param  {string} filePath
 * @return {boolean}
 */
JSLoader.prototype.matchPath = function(filePath) {
  return this.getExtensions().some(function(ext) {
    return filePath.lastIndexOf(ext) === filePath.length - ext.length;
  });
};

/**
 * Post process是在资源表更新之后但是更新任务还未完成. JSLoader的 `postProcess`
 * 静态分析依赖模块. 也就是说将`require()`调用中的文本对应到模块ID.
 * 只能在得到全部资源表后的后处理过程中解析, 此时每个模块的ID才能确定. 这个时候确认ID
 * 有利于接下来的打包操作.
 *
 * 两个文件的代码也许都有:
 * `require('../path/to.js')`
 *
 * But they end up resolving to two distinct dependencies/IDs, because the
 * calling file is located in a different base directory.
 *
 * @param  {ResourceMap}      map
 * @param  {Array.<Resource>} resources
 * @param  {Function}         callback
 */
JSLoader.prototype.postProcess = function(map, resources, callback) {
  var messages = MessageList.create();

  // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的, 而不论调用require
  // 的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID. 否则话调用
  // `utils.findAbsolutePathForRequired`方法查找路径.
  // 这个缓存只对非相对路径('.'开头)有效.
  var nonRelativePathCache = {};

  /**
   * @param {Resource} r
   * @param {Array.<Resource>} rs
   * @param {string} type
   */
  function fixModuleID(r, rs, type) {
    var required = rs || [];
    var resource, i;
    for (i = 0; i < required.length; i++) {
      var requiredText = required[i];
      resource = map.getResource(type.toUpperCase(), requiredText);

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
        utils.findAbsolutePathForRequired(requiredText, r.path, map);

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
  }

  resources.forEach(function(r) {
    // 依赖的js模块
    fixModuleID(r, r.requiredModules, 'JS');
    // 依赖的css模块
    fixModuleID(r, r.requiredCSS, 'CSS');
  });

  process.nextTick(function() {
    callback(messages);
  });
};

/**
 * @param {Object} object
 * @returns {C}
 */
JSLoader.fromObject = function(object) {
  var C = require(object.path);
  return new C(object.options);
};

// 导出
module.exports = JSLoader;