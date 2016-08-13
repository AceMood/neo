/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file js loader
 * @author AceMood
 */

/* globals logger */

'use strict';

const docblock       = require('../parser/docblock');
const jsParser       = require('../parser/jsparser');
const JS             = require('../resource/JS');
const ResourceLoader = require('./ResourceLoader');
const utils          = require('../util');
const directives     = require('./directives');

/**
 * 根据资源表信息保存资源的唯一路径
 * @param {ResourceMap}    map   资源表
 * @param {Resource}       r     当前资源
 * @param {Array.<string>} deps
 * @param {string}         type  资源类型
 * @param {object}         cache 需更新的缓存对象
 */
const fixModule = function(map, r, deps, type, cache) {
  let required = deps || [];
  let resource, i;
  for (i = 0; i < required.length; i++) {
    let requiredText = required[i];
    resource = map.getResource(type, requiredText);

    // 如果就是按照id引用的
    if (resource) {
      if (r.recordRequiredModuleOrigin) {
        r.recordRequiredModuleOrigin(required[i], resource.path);
      }
      required[i] = resource.id;
      continue;
    }

    // @module and standard require('projectName/path/to.js') would
    // have been caught above - now handle commonJS relative dirs, and
    // package.json main files.
    let isRelative = requiredText.charAt(0) === '.';
    let textInCache = requiredText in cache;
    // 解析出资源的path
    let resolvedPath = !isRelative && textInCache ?
      cache[requiredText] :
      utils.resolveModulePath(requiredText, r.path);

    // 缓存
    if (!isRelative && !textInCache) {
      cache[requiredText] = resolvedPath;
    }

    // 如果通过id没找到, 用commonjs的实现寻找资源.
    let resolvedResource = resolvedPath && map.getResourceByPath(resolvedPath);

    // Some modules may not have ids - this is likely a bug - their package's
    // haste roots might be incorrect.
    if (resolvedResource && resolvedResource.id) {
      if (resolvedResource.id !== required[i]) {
        // 资源中记录原始require的文本和对应模块的path (path一定保持唯一)
        if (r.recordRequiredModuleOrigin) {
          r.recordRequiredModuleOrigin(required[i], resolvedResource.path);
          required[i] = resolvedResource.id;
        }
      }
    }
  }
};

class JSLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {JSLoader}
   */
  static fromObject(object) {
    return new JSLoader(object.options);
  }

  /**
   * 加载并解析JavaScript files
   * Loader的作用要解析源码中的document block, 计算gzip大小.
   * @param {?object=} options 选项如下:
   *                           - networkSize
   *                           - preProcessors
   *                           - postProcessors
   */
  constructor(options) {
    super(options);
    this.preProcessors = this.options.preProcessors;
    this.postProcessors = this.options.postProcessors
  }

  getResourceTypes() {
    return [JS];
  }

  getExtensions() {
    return this.options.extensions || ['.js', '.jsx'];
  }

  /**
   * 解析注释头
   * @param {JS} js
   * @param {string} sourceCode
   */
  parseDocblock(js, sourceCode) {
    let props = docblock.parse(docblock.extract(sourceCode));
    props.forEach(pair => {
      let name = pair[0];
      let value = pair[1];

      if (!directives.assign(name, value, js)) {
        logger.warn(
          js.path,
          ' has unknown directive "',
          name + '".'
        );
      }
    });
  }

  /**
   * 从源码解析出最终的Resource对象.
   * @param {string} path      resource being built
   * @param {ProjectConfiguration} configuration 当前js文件所在工程目录下如果有package.json
   *                                             配置文件, 则传入该配置资源
   * @param {string} sourceCode js代码
   * @param {function} callback
   */
  loadFromSource(path, configuration, sourceCode, callback) {
    let js = new JS(path);

    // resolve module ids through configuration
    // 模块外的require不支持
    if (!js.id) {
      js.id = configuration ? configuration.resolveID(js.path) : js.path;
    }

    js.setContent(sourceCode);

    // hook for file content's preProcessors
    if (Array.isArray(this.preProcessors)) {
      this.preProcessors.forEach(processor => {
        sourceCode = processor(js);
      });
    }

    // 根据头注释改变资源属性
    this.parseDocblock(js, sourceCode);

    // 解析依赖的同步/异步模块
    if (js.isModule || js.isEntryPoint) {
      jsParser
        .requireCalls(sourceCode)
        .forEach(js.addRequiredModule, js);
      jsParser
        .requireAsyncCalls(sourceCode)
        .forEach(js.addRequiredAsyncModule, js);
    }

    js.finalize();

    process.nextTick(() => {
      callback(js);
    });
  }

  matchPath(filePath) {
    return this.getExtensions().some(
        ext => filePath.lastIndexOf(ext) === filePath.length - ext.length
    );
  }

  /**
   * postProcess occurs after updating map but before complete.
   * JSLoader's `#postProcess` statically analyze dependency.
   * 将`require()`调用中的文本对应到模块ID.
   * 只能在得到全部资源表后的后处理过程中解析, 此时每个模块的ID才能确定. 这个时候确认ID
   * 有利于接下来的打包操作.
   * 两个文件的代码也许都有:
   * `require('../path/to.js')`
   *
   * But they end up resolving to two distinct dependencies/IDs, because the
   * calling file is located in a different base directory.
   *
   * @param  {ResourceMap}      map
   * @param  {Array.<Resource>} resources
   * @param  {function}         callback
   */
  postProcess(map, resources, callback) {
    // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的, 而不论调用require
    // 的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID. 否则话调用
    // `utils.resolveModulePath`方法查找路径.
    // 这个缓存只对非相对路径('.'开头)有效.
    let nonRelativePathCache = {};

    resources.forEach(r => {
      // 同步依赖的js模块
      fixModule(map, r, r.requiredModules, 'js', nonRelativePathCache);
      // 同步依赖的css模块
      fixModule(map, r, r.requiredCSS, 'css', nonRelativePathCache);
      // 异步依赖的模块
      fixModule(map, r, r.requiredAsyncModules, 'js', nonRelativePathCache);
    });

    process.nextTick(() => {
      callback();
    });
  }
}

module.exports = JSLoader;