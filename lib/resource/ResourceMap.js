/**
 * @file 资源表
 */

'use strict';

/**
 * 资源表, id识别
 * @constrictor
 * @param {Array.<Resource>} resources 初始化需要添加的资源
 * @param {?Object} typeToMap
 */
function ResourceMap(resources, typeToMap) {
  // 资源表缓存，数组
  this.resourceCache = null;
  // 保存遍历的项目目录, 数组
  this.inferredProjectPaths = null;
  // 字典树对象方便查找configuration资源
  this.configurationTrie = null;
  // 资源表, 按类型分类, id为key
  this.resourceMap = {};
  // path为key，资源为value的对象结构
  this.resourcePathMap = {};
  //
  this.typeToMap = typeToMap || {};

  resources && resources.forEach(this.addResource, this);
}

/**
 * 取资源
 * @param {string} type 资源类型
 * @param {string} id   资源id
 * @returns {Resource}
 */
ResourceMap.prototype.getResource = function(type, id) {
  type = this.typeToMap[type] || type;
  var typeMap = this.resourceMap[type];
  return typeMap && typeMap[id];
};

/**
 * Neo本身支持允许设定任意查找目录, 否则会遍历整个`.`目录查找项目文件.
 * 试想每次添加新项目时都要手动设置所有NODE_PATH变量.
 *
 * This function extracts out a list of those
 * automatically created project roots.
 *
 * WARNING: Do not call this frequently, only once/twice per entire postProcess,
 * definitely never on a single module load.
 *
 * @return {Array<string>} List of absolute paths to project roots that are
 * inferred from loaded resources that assume the role of a "project".
 */
ResourceMap.prototype.getAllInferredProjectPaths = function() {
  if (!this.inferredProjectPaths) {
    var found = {};
    this.getAllResources().forEach(function(resource) {
      if (resource.getInferredProjectPath) {
        found[resource.getInferredProjectPath()] = true;
      }
    }, this);
    this.inferredProjectPaths = Object.keys(found);
  }
  return this.inferredProjectPaths;
};

/**
 * 根据资源对象返回配置资源对象
 * @param {Resource} resource
 * @returns {ProjectConfiguration=}
 */
ResourceMap.prototype.getConfigurationForResource = function(resource) {
  return this.getConfigurationByPath(resource.path);
};

/**
 * 根据资源路径返回配置资源对象
 * @param {String} path
 * @returns {*}
 */
ResourceMap.prototype.getConfigurationByPath = function(path) {
  if (!this.configurationTrie) {
    var ConfigurationTrie = require('../ConfigurationTrie');
    this.configurationTrie = new ConfigurationTrie(
        this.getAllResourcesByType('ProjectConfiguration'));
  }
  return this.configurationTrie.findConfiguration(path);
};

/**
 * 根据路径取资源
 * @param {String} path
 * @returns {?Resource}
 */
ResourceMap.prototype.getResourceByPath = function(path) {
  return this.resourcePathMap[path];
};

/**
 * 获取所有资源表中的资源, 若有缓存的话则读取缓存.
 * @returns {?Array}
 */
ResourceMap.prototype.getAllResources = function() {
  if (!this.resourceCache) {
    var cache = [];
    var map = this.resourcePathMap;
    Object.keys(map).forEach(function(k) {
      map[k] && cache.push(map[k]);
    }, this);
    this.resourceCache = cache;
  }
  return this.resourceCache;
};

/**
 * 根据类型返回全部资源
 * @param {String} type 资源类型
 * @returns {Array}
 */
ResourceMap.prototype.getAllResourcesByType = function(type) {
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
};

/**
 * 添加资源
 * @param {Resource} resource
 */
ResourceMap.prototype.addResource = function(resource) {
  this.configurationTrie = this.resourceCache = null;
  this.inferredProjectPaths = null;
  var type = this.typeToMap[resource.type] || resource.type;
  if (!this.resourceMap[type]) {
    this.resourceMap[type] = {};
  }

  // 会覆盖已有资源
  // todo
  if (this.resourceMap[type][resource.id]) {
    // debugger;
  }

  // 更新
  this.resourcePathMap[resource.path] = resource;
  this.resourceMap[type][resource.id] = resource;
};

/**
 * 更新某个资源
 * @param {Resource} oldResource
 * @param {Resource} newResource
 */
ResourceMap.prototype.updateResource = function(oldResource, newResource) {
  this.configurationTrie = this.resourceCache = null;
  this.inferredProjectPaths = null;
  this.removeResource(oldResource);
  this.addResource(newResource);
};

/**
 * 从资源表删除资源
 * @param {Resource} resource
 */
ResourceMap.prototype.removeResource = function(resource) {
  var type = this.typeToMap[resource.type] || resource.type;
  this.configurationTrie = this.resourceCache = null;
  this.inferredProjectPaths = null;
  this.resourcePathMap[resource.path] = undefined;
  if (this.resourceMap[type] && this.resourceMap[type][resource.id]) {
    this.resourceMap[type][resource.id] = undefined;
  }
};

// 导出
module.exports = ResourceMap;