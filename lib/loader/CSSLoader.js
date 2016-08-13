/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 加载css资源
 * @author AceMood
 */

/* globals logger */

'use strict';

const docblock       = require('../parser/docblock');
const ResourceLoader = require('./ResourceLoader');
const cssParser      = require('../parser/cssparser');
const CSS            = require('../resource/CSS');
const utils          = require('../util');
const directives     = require('./directives');

class CSSLoader extends ResourceLoader {
  /**
   * @param   {object} object
   * @returns {CSSLoader}
   */
  static fromObject(object) {
    return new CSSLoader(object.options);
  }

  /**
   * 加载解析css文件. 从头部注释中解析选项, 计算gzip大小. 默认不计算可以通过配置开启.
   * @param {?object} options Object with the following options:
   *                              - networkSize
   *                              - preProcessors
   *                              - postProcessors
   */
  constructor(options) {
    super(options);
    this.preProcessors = this.options.preProcessors;
    this.postProcessors = this.options.postProcessors
  }

  /**
   * 返回加载器可加载的资源类型
   * @returns {Array.<Resource>}
   */
  getResourceTypes() {
    return [CSS];
  }

  /**
   * 返回可加载资源类型对应的后缀名
   * @returns {Array.<string>}
   */
  getExtensions() {
    return ['.css', '.less'];
  }

  /**
   * 解析注释头
   * @param {CSS} css
   * @param {string} sourceCode
   */
  parseDocblock(css, sourceCode) {
    let props = docblock.parse(docblock.extract(sourceCode));
    props.forEach(pair => {
      let name = pair[0];
      let value = pair[1];

      if (!directives.assign(name, value, css)) {
        // various options
        logger.warn(
          css.path,
          ' has unknown directive "',
          name + '".'
        );
      }
    });
  }

  /**
   * 利用源码中的信息初始化一个资源.
   * Loader可以解析, gzip, 压缩源码以得到最终的Resource object.
   * @protected
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {string}               sourceCode
   * @param {function}             callback
   */
  loadFromSource(path, configuration, sourceCode, callback) {
    let css = new CSS(path);

    if (!css.id) {
      css.id = configuration ? configuration.resolveID(css.path) : css.path;
    }

    css.setContent(sourceCode);

    // hook for file content's preProcessors
    if (Array.isArray(this.preProcessors)) {
      this.preProcessors.forEach(processor => {
        sourceCode = processor.execute(css);
      });
    }

    // 根据头注释改变资源属性
    this.parseDocblock(css, sourceCode);

    // 解析sprite
    cssParser.extractSprites(sourceCode).forEach(css.addSprite, css);

    css.finalize();

    process.nextTick(() => {
      callback(css);
    });
  }

  /**
   * 匹配*.css文件
   * @param  {string} filePath
   * @return {boolean}
   */
  matchPath(filePath) {
    return this.getExtensions().some(
        ext => filePath.lastIndexOf(ext) === filePath.length - ext.length
    );
  }

  /**
   * 后处理发生在资源表更新之后, 但是在升级任务完成前.
   * Used to resolve local required paths and /index.js directory requires
   * @param {ResourceMap}      map
   * @param {Array.<Resource>} resources
   * @param {function}         callback
   */
  postProcess(map, resources, callback) {
    // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的,
    // 而不论调用require的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID.
    // 否则调用`utils.resolveModulePath`方法查找路径.
    // 这个缓存只对非相对路径('.'开头)有效.
    let nonRelativePathCache = {};

    resources.forEach(r => {
      let required = r.requiredCSS;
      let resource;
      for (let i = 0; i < required.length; i++) {
        let requiredText = required[i];
        resource = map.getResource('css', requiredText);

        // 如果就是按照id引用的
        if (resource) {
          continue;
        }

        // @css 'projectName/path/to.css' would have been caught above -
        // now handle relative dirs, and package.json main files.
        let isRelative = requiredText.charAt(0) === '.';
        let textInCache = requiredText in nonRelativePathCache;

        let resolvedPath = !isRelative && textInCache ?
          nonRelativePathCache[requiredText] :
          utils.resolveModulePath(requiredText, r.path);

        // 缓存
        if (!isRelative && !textInCache) {
          nonRelativePathCache[requiredText] = resolvedPath;
        }

        // If not found by ID, we use path for lookup.
        let resolvedResource = resolvedPath
          && map.getResourceByPath(resolvedPath);

        // Some modules may not have ids - this is likely a bug - their package's
        // haste roots might be incorrect.
        if (resolvedResource && (resolvedResource.id !== required[i])) {
          if (r.recordRequiredModuleOrigin) {
            r.recordRequiredModuleOrigin(required[i], resolvedPath);
            required[i] = resolvedResource.id;
          }
        }
      }
    });

    process.nextTick(() => {callback();});
  }
}

module.exports = CSSLoader;