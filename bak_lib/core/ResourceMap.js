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
 * @file 资源表
 * @author AceMood
 */

/* globals logger */

'use strict';

class ResourceMap {
  /**
   * 资源表, id识别
   * @param {?Array.<Resource>=} resources 初始化需要添加的资源
   * @param {object=} typeToMap
   */
  constructor(resources, typeToMap) {
    // 资源表缓存，数组
    this.resourceCache = null;
    // 字典树对象方便查找configuration资源
    this.configurationTrie = null;
    // 资源表, 按类型分类, id为key
    this.resourceMap = {};
    // path为key，资源为value的对象结构
    this.resourcePathMap = {};
    // 为多种资源可能映射为同一类型
    this.typeToMap = typeToMap || {};

    resources && resources.forEach(this.addResource, this);
  }

  /**
   * 取资源
   * @param {string} type 资源类型
   * @param {string} id   资源id
   * @returns {Resource}
   */
  getResource(type, id) {
    type = this.typeToMap[type] || type;
    let typeMap = this.resourceMap[type];
    return typeMap && typeMap[id];
  }

  /**
   * 根据资源对象返回配置资源对象
   * @param {Resource} resource
   * @returns {ProjectConfiguration=}
   */
  getConfigurationForResource(resource) {
    return this.getConfigurationByPath(resource.path);
  }

  /**
   * 根据资源路径返回配置资源对象
   * @param {String} path
   * @returns {*}
   */
  getConfigurationByPath(path) {
    if (!this.configurationTrie) {
      let ConfigurationTrie = require('../ConfigurationTrie');
      this.configurationTrie = new ConfigurationTrie(
        this.getAllResourcesByType('ProjectConfiguration'));
    }
    return this.configurationTrie.findConfiguration(path);
  }

  /**
   * 根据路径取资源
   * @param {String} path
   * @returns {?Resource}
   */
  getResourceByPath(path) {
    return this.resourcePathMap[path];
  }

  /**
   * 获取所有资源表中的资源, 若有缓存的话则读取缓存.
   * @returns {?Array}
   */
  getAllResources() {
    if (!this.resourceCache) {
      let cache = [];
      let map = this.resourcePathMap;
      Object.keys(map).forEach(k => {
        map[k] && cache.push(map[k]);
      });
      this.resourceCache = cache;
    }
    return this.resourceCache;
  }

  /**
   * 根据类型返回全部资源
   * @param {String} type 资源类型
   * @returns {Array}
   */
  getAllResourcesByType(type) {
    type = this.typeToMap[type] || type;
    if (!this.resourceMap[type]) {
      return [];
    }

    return Object.keys(this.resourceMap[type])
      .map(function(key) {
        return this.resourceMap[type][key];
      }, this)
      .filter(function(r) {
        return r;
      });
  }

  /**
   * 添加资源
   * @param {Resource} resource
   */
  addResource(resource) {
    this.configurationTrie = this.resourceCache = null;
    let type = this.typeToMap[resource.type] || resource.type;
    if (!this.resourceMap[type]) {
      this.resourceMap[type] = {};
    }

    // 会覆盖已有资源
    if (this.resourceMap[type][resource.id]) {
      let msg = `Resource at ${resource.path} have the same id
      with resource at ${this.resourceMap[type][resource.id].path}`;

      logger.error(msg);
      throw new Error(msg);
    }

    // 更新
    this.resourcePathMap[resource.path] = resource;
    this.resourceMap[type][resource.id] = resource;
  }

  /**
   * 更新某个资源
   * @param {Resource} oldResource
   * @param {Resource} newResource
   */
  updateResource(oldResource, newResource) {
    this.configurationTrie = this.resourceCache = null;
    this.removeResource(oldResource);
    this.addResource(newResource);
  }

  /**
   * 从资源表删除资源
   * @param {Resource} resource
   */
  removeResource(resource) {
    let type = this.typeToMap[resource.type] || resource.type;
    this.configurationTrie = this.resourceCache = null;
    delete this.resourcePathMap[resource.path];

    if (this.resourceMap[type] && this.resourceMap[type][resource.id]) {
      delete this.resourceMap[type][resource.id];
    }
  }
}

module.exports = ResourceMap;