/**
 * @file 序列化资源表的类
 */

'use strict';

var fs = require('fs');
var ResourceMap = require('./map/ResourceMap');

/**
 * 序列化资源表的类. 读写资源表. 用JSON函数来做序列/反序列化。
 * @constructor
 * @param {Array.<ResourceLoader>} loaders
 * @param {?Object} options
 */
function MapSerializer(loaders, options) {
  options = options || {};
  this.version = options.version || '0.1';
  this.typeMap = {};
  loaders.forEach(function(loader) {
    loader.getResourceTypes().forEach(function(type) {
      this.typeMap[type.prototype.type] = type;
    }, this);
  }, this);
}

/**
 * 异步加载文件反序列化之
 * @param {string} path 文件绝对路径
 * @param {function} callback 回调函数
 */
MapSerializer.prototype.loadFromPath = function(path, callback) {
  var me = this;
  fs.readFile(path, 'utf-8', function(err, code) {
    // 容错
    if (err || !code) {
      callback(err, null);
      return;
    }

    var ser = JSON.parse(code);
    var map = me.fromObject(ser);
    callback(null, map);
  });
};

/**
 * 加载文件反序列化之
 * @param {String} path 文件绝对路径
 * @returns {ResourceMap}
 */
MapSerializer.prototype.loadFromPathSync = function(path) {
  var code;
  try {
    code = fs.readFileSync(path, 'utf-8');
  } catch (e) {
    return null;
  }
  if (!code) {
    return null;
  }

  var ser = JSON.parse(code);
  return this.fromObject(ser);
};

/**
 * 从对象生成资源表
 * @param {!Object} ser
 * @returns {?ResourceMap}
 */
MapSerializer.prototype.fromObject = function(ser) {
  if (ser.version === this.version) {
    var map = new ResourceMap();
    ser.objects.forEach(function(obj) {
      var type = this.typeMap[obj.type];
      map.addResource(type.fromObject(obj));
    }, this);
    return map;
  } else {
    return null;
  }
};

/**
 * 序列化资源表存储到文件
 * @param {string}      path
 * @param {ResourceMap} map
 * @param {function}    callback
 */
MapSerializer.prototype.storeToPath = function(path, map, callback) {
  var ser = this.toObject(map);
  fs.writeFile(path, JSON.stringify(ser, null, 2), 'utf-8', callback);
};

/**
 * 序列化资源表
 * @param {ResourceMap} map
 * @returns {{version: *, objects: Array}}
 */
MapSerializer.prototype.toObject = function(map) {
  return {
    version: this.version,
    objects: map.getAllResources()
        .filter(function(resource) {
          return !resource.isConfiguration
              && !resource.isPage;
        })
        .map(function(resource) {
          return resource.toObject();
        })
  };
};

// 导出
module.exports = MapSerializer;