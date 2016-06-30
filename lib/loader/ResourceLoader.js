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
 * @file ResourceLoader基类.
 * @author AceMood
 */

/* globals logger */

'use strict';

var fs = require('fs');
var Resource = require('../resource/Resource');

class ResourceLoader {
  /**
   * @param {object} object
   * @returns {ResourceLoader}
   */
  static fromObject(object) {
    return new ResourceLoader(object.options);
  }

  /**
   * ResourceLoader和MapUpdateTask一起解析不同的资源类型.
   * 每一个loader类型可以加载一种或多种文件后缀.
   * 每个loader可以接受一些选项配置加载过程.
   * loader默认会读取文件内容解析代码提取出有用的信息.
   * @param {?object} options
   */
  constructor(options) {
    this.options = options || {};
  }

  toObject() {
    return {
      options: this.options
    };
  }

  /**
   * @override
   * @returns {Array.<Resource>}
   */
  getResourceTypes() {
    return [Resource];
  }

  /**
   * @override
   * @returns {Array}
   */
  getExtensions() {
    return [];
  }

  /**
   * Creates a new resource for a given path. Can be overridden in a sublcass
   * to perform different loading
   * @override
   * @param {string} path 资源路径
   * @param {ProjectConfiguration=} configuration
   * @param {function} callback 回调函数
   */
  loadFromPath(path, configuration, callback) {
    var me = this;

    fs.readFile(path, 'utf-8', (err, sourceCode) => {
      if (err) {
        logger.error('Reading file at: ' + path);
        throw err;
      } else {
        me.loadFromSource(
          path,
          configuration,
          sourceCode || '',
          callback);
      }
    });
  }

  /**
   * 用配置和源码初始化一个资源对象. Loader可以解析, gzip, minify源码
   * 完成最终资源对象的生成. 缓存文件内容, 后续的打包阶段可以读取缓存文件内容.
   * @protected
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {string}               sourceCode
   * @param {function}             callback
   */
  loadFromSource(path, configuration, sourceCode, callback) {
    var resource = new Resource(path);
    resource.setContent(sourceCode);
    process.nextTick(() => {
      callback(resource);
    });
  }

  /**
   * 检查是否可以解析指定路径的资源. 基类永远返回true, 因为有可能解析任何类型的文件
   * @param  {string} path
   * @return {boolean}
   */
  matchPath() {
    return true;
  }

  /**
   * 资源加载器的后处理发生在资源表升级后, 但是升级任务完成前.
   * Can be used to resolve dependencies or to bulk process all loaded resources
   * @param {ResourceMap}      map
   * @param {Array.<Resource>} resources
   * @param {function}         callback
   */
  postProcess(map, resources, callback) {
    process.nextTick(() => {
      callback();
    });
  }
}

module.exports = ResourceLoader;