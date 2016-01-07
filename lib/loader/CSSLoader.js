/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file 加载css资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var zlib = require('zlib');
var docblock = require('../parser/docblock');
var ResourceLoader = require('./ResourceLoader');
var cssParser = require('../parser/cssParser');
var CSS = require('../resource/CSS');
var utils = require('../util');

const spaceRe = /\s+/;
class CSSLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {CSSLoader}
   */
  static fromObject(object) {
    return new CSSLoader(object.options, object.logger);
  }

  /**
   * 加载解析css文件. 从头部注释中解析选项, 计算gzip大小. 默认不计算可以通过配置开启.
   * @param {?object} options Object with the following options:
   *                              - extractNetworkSize
   *                              - extractSprites
   * @param {Logger} logger
   */
  constructor(options, logger) {
    super(options, logger);
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
    var props = docblock.parse(docblock.extract(sourceCode));
    var me = this;
    props.forEach(pair => {
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
        default:
          // various options
          me.logger.warn(
            '[Warning] ',
            css.path,
            ' has unknown directive ',
            name);
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
    var css = new CSS(path);
    var me = this;

    this.parseDocblock(css, sourceCode);

    if (!css.id) {
      if (configuration) {
        css.id = configuration.resolveID(css.path);
      } else {
        css.id = css.path;
      }
    }

    // 解析sprite
    if (this.options.extractSprites) {
      cssParser.extractSprites(sourceCode).forEach(css.addSprite, css);
    }

    css.finalize();

    // 附带上文件内容
    css.setContent(sourceCode);

    // 是否计算网络传输
    if (!!this.options.networkSize) {
      zlib.deflate(sourceCode, (err, buffer) => {
        css.networkSize = buffer.length;
        callback(css);
      });
    } else {
      callback(css);
    }
  }

  /**
   * 匹配*.css文件
   * @param  {string} filePath
   * @return {boolean}
   */
  matchPath(filePath) {
    return this.getExtensions().some(ext => {
      return filePath.lastIndexOf(ext) === filePath.length - ext.length;
    });
  }

  /**
   * 后处理发生在资源表更新之后, 但是在升级任务完成前.
   * Used to resolve local required paths and /index.js directory requires
   * @param {ResourceMap}      map
   * @param {Array.<Resource>} resources
   * @param {function}         callback
   */
  postProcess(map, resources, callback) {
    var me = this;

    // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的, 而不论调用require
    // 的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID. 否则话调用
    // `utils.findAbsolutePathForRequired`方法查找路径.
    // 这个缓存只对非相对路径('.'开头)有效.
    var nonRelativePathCache = {};

    resources.forEach(r => {
      var required = r.requiredCSS;
      var resource, i;
      for (i = 0; i < required.length; i++) {
        var requiredText = required[i];
        resource = map.getResource('CSS', requiredText);
        // Already requiring by ID - no static resolution needed.
        if (resource) {
          continue;
        }

        // @css 'projectName/path/to.css' would have been caught above -
        // now handle commonJS relative dirs, and package.json main files.
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
            // other files end up here. They don't have this method.
            if (r.recordRequiredModuleOrigin) {
              r.recordRequiredModuleOrigin(required[i], resolvedResource.id);
              required[i] = resolvedResource.id;
            }
          }
        }
      }
    });

    callback();
  }
}

module.exports = CSSLoader;