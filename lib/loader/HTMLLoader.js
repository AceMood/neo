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
 * @file html文件加载器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

const zlib = require('zlib');
const htmlParser = require('../parser/htmlParser');
const HTML = require('../resource/HTML');
const ResourceLoader = require('./ResourceLoader');
const utils = require('../util');

class HTMLLoader extends ResourceLoader {
  /**
   * @param   {object} object
   * @returns {HTMLLoader}
   */
  static fromObject(object) {
    return new HTMLLoader(object.options);
  }

  /**
   * 加载并解析html files
   * Loader的作用要解析源码中的<script>, <link>, <style>, <img />
   * 并计算gzip大小.
   * @param {?object=} options 选项如下:
   *                              - networkSize
   */
  constructor(options) {
    super(options);

    this.placeholder = {
      css: options.cssplaceholder || '<!-- css -->',
      js: options.jsplaceholder || '<!-- js -->'
    };
  }

  getResourceTypes() {
    return [HTML];
  }

  getExtensions() {
    return this.options.extensions || ['.html', '.htm', 'xhtml'];
  }

  /**
   * 从源码解析出最终的Resource对象.
   * @param {string} path      resource being built
   * @param {ProjectConfiguration} configuration 当前html文件所在工程目录下如果有package.json
   *                                             配置文件, 则传入该配置资源
   * @param {string} sourceCode html代码
   * @param {function} callback
   */
  loadFromSource(path, configuration, sourceCode, callback) {
    let html = new HTML(path);

    // 计算资源id
    if (configuration) {
      html.id = configuration.resolveID(html.path);
    } else {
      html.id = html.path;
    }

    // 解析依赖的同步/异步模块
    htmlParser
      .scriptTag(sourceCode)
      .forEach(html.addRequiredJS, html);
    htmlParser
      .linkTag(sourceCode)
      .forEach(html.addRequiredCSS, html);
    htmlParser
      .imgTag(sourceCode)
      .forEach(html.addRequiredImage, html);

    html.finalize();

    // 附带上文件内容
    html.setContent(sourceCode);

    // call generated function
    if (this.options.networkSize) {
      zlib.gzip(sourceCode, (err, buffer) => {
        if (err) {
          logger.warn(
            'Calculating ' + html.path + ' network size error.',
            err.message
          );
        } else {
          html.networkSize = buffer.length;
        }

        callback(html);
      });
    } else {
      callback(html);
    }
  }

  matchPath(filePath) {
    return this.getExtensions().some(
        ext => filePath.lastIndexOf(ext) === filePath.length - ext.length
    );
  }

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
   * @param  {function}         callback
   */
  postProcess(map, resources, callback) {
    // 依赖文件不是以'.'开头的对同一个资源表应该每次查找出来的path都是一样的, 而不论调用require
    // 的文件是哪个, 所以这情况可以缓存解析过的require参数和对应的moduleID. 否则话调用
    // `utils.findAbsolutePathForRequired`方法查找路径.
    // 这个缓存只对非相对路径('.'开头)有效.
    let nonRelativePathCache = {};

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

    resources.forEach(r => {
      // 依赖的js模块
      fixModuleID(r, r.requiredJS, 'JS');
      // 依赖的css模块
      fixModuleID(r, r.requiredCSS, 'CSS');
      // 图像
      fixModuleID(r, r.requiredImage, 'Image');
    });

    process.nextTick(() => {
      callback();
    });
  }

  compile() {

  }
}

module.exports = HTMLLoader;