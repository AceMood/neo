/**
 * @file 打包构建产出资源表.
 *     neo.update依次触发以下事件:
 *     found          Finder扫描完了工程目录
 *     mapLoaded      缓存的.cache序列化成资源表加载完毕
 *     changed        有文件内容有改动
 *     analyzed
 *     mapUpdated
 *     postProcessed
 *     complete
 *     mapStored
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var fs = require('fs');
var path = require('path');

var ResourceMap = require('./resource/ResourceMap');
var FileFinder = require('./FileFinder');
var MapUpdateTask = require('./MapUpdateTask');
var MapSerializer = require('./MapSerializer');
var loaders = require('./loaders');

/**
 * 构建工具门面
 * @constructor
 * @param {Array.<ResourceLoader>} loaders  预置加载器的实例
 * @param {Array.<String>} scanDirs 要扫描的目录数组, 位置相对于当前执行目录.
 * @param {?Object} options 配置对象.
 *   options可包含以下字段：
 *     finder {?FileFinder}  自定义文件扫描器
 *     serializer {?MapSerializer}  自定义序列化资源表
 *     maxOpenFiles {?Number} loaders的最大数目, MapUpdateTask用到
 *     maxProcesses {?Number}  Maximum number of loader forks MapUpdateTask can use
 *     useNativeFind {?Boolean}  使用linux系统的shell命令(faster)还是node实现的方法(safer)
 *     ignorePaths {?Function:Boolean}  返回是否忽略路径的函数
 *     version {?String}  缓存的版本. 如果版本和缓存不一致则忽略缓存。
 */
function Neo(loaders, scanDirs, options) {
  EventEmitter.call(this);

  this.loaders = loaders;
  this.scanDirs = scanDirs;
  this.options = options || {};
  this.finder = this.options.finder || null;
  this.serializer = this.options.serializer || null;
}
inherits(Neo, EventEmitter);

/**
 * 本函数:
 *  1) load cache if exists
 *  2) compare to the existing files
 *  3) analyze changes,
 *  4) update map,
 *  5) write cache back to disk
 *  6) return map
 *
 * @param {String} path 资源表打印路径
 * @param {Function} callback 升级后回调函数
 * @param {?Object} options 配置对象
 */
Neo.prototype.update = function(path, callback, options) {
  var map, files;
  var me = this;

  var run = function() {
    if (!map || !files) {
      return;
    }
    var task = me.createUpdateTask(files, map)
        .on('complete', function(map) {
          // only store map if it's changed
          var mapChanged = task.changed.length > task.skipped.length;
          if (mapChanged) {
            me.storeMap(path, map, function() {
              me.emit('mapStored');
              callback(map, task.messages);
            });
          } else {
            callback(map, task.messages);
          }
        })
        .run();
  };

  this.getFinder().find(function(f) {
    files = f;
    // 找到所有的静态文件
    me.emit('found', files);
    run();
  });

  // 强制创建资源表
  if (options && options.forceRescan) {
    map = new ResourceMap();
  } else {
    this.loadOrCreateMap(path, function(m) {
      map = m;
      // 加载资源表成功
      me.emit('mapLoaded');
      run();
    });
  }
};

/**
 * Same as update but will also rerun the update every time something changes
 *
 * TODO: (voloko) add support for inotify and FSEvent instead of constantly
 * running finder
 *
 * @param  {String}   path
 * @param  {Function} callback
 * @param  {Number}   options.timeout How often to rerun finder
 * @param  {Boolean}  options.forceRescan
 */
Neo.prototype.watch = function(path, callback, options) {
  var timeout = options && options.timeout || 1000;
  var finder = this.getFinder();
  var map, files, task;
  var me = this;
  var firstRun = true;

  function find() {
    finder.find(function(f) {
      files = f;
      if (map) {
        update();
      }
    });
  }

  function updated(m) {
    map = m;
    var mapChanged = task.changed.length > task.skipped.length;
    // if changed, store the map and only then callback and schedule next run
    if (mapChanged) {
      me.storeMap(path, map, function() {
        callback(map, task.changed, task.messages);
        setTimeout(find, timeout);
      });
      return;
    }

    // callback on the first run even if the map is unchanged
    if (firstRun) {
      firstRun = false;
      callback(map, task.changed, task.messages);
    }
    setTimeout(find, timeout);
  }

  function update() {
    task = me.createUpdateTask(files, map).on('complete', updated).run();
  }

  if (options && options.forceRescan) {
    map = new ResourceMap();
  } else {
    this.loadOrCreateMap(path, function(m) {
      map = m;
      if (files) {
        update();
      }
    });
  }

  find();
};

/**
 * 更新资源表, 传入回调函数, 但是也必须传入资源表对象.
 * @param {ResourceMap} map
 * @param {Function} callback
 */
Neo.prototype.updateMap = function(map, callback) {
  // files数组包含文件名和mtime
  this.getFinder().find(function(files) {
    this.createUpdateTask(files, map)
        .on('complete', callback)
        .run();
  }.bind(this));
};

/**
 * 异步加载资源表
 * @param {String} path
 * @param {Function} callback
 * @return {?ResourceMap}
 */
Neo.prototype.loadMap = function(path, callback) {
  this.getSerializer().loadFromPath(path, callback);
};

/**
 * 同步加载资源表
 * @param  {String} path
 * @return {?ResourceMap}
 */
Neo.prototype.loadMapSync = function(path) {
  return this.getSerializer().loadFromPathSync(path);
};

/**
 * 异步加载资源表若没有则创建一个
 * @param {String} path
 * @param {Function} callback
 */
Neo.prototype.loadOrCreateMap = function(path, callback) {
  this.getSerializer().loadFromPath(path, function(err, map) {
    callback(map || new ResourceMap());
  });
};

/**
 * 同步加载或创建资源表
 * @param {String} path
 * @return {ResourceMap}
 */
Neo.prototype.loadOrCreateMapSync = function(path) {
  return this.loadMapSync(path) || new ResourceMap();
};

/**
 * 将资源表写入磁盘
 * @param {String} path
 * @param {ResourceMap} map
 * @param {Function} callback
 */
Neo.prototype.storeMap = function(path, map, callback) {
  this.getSerializer().storeToPath(path, map, callback);
};

/**
 * 创建更新资源表的任务，代理向外界分发事件
 * @param {Array} files
 * @param {ResourceMap} map
 * @return {MapUpdateTask}
 */
Neo.prototype.createUpdateTask = function(files, map) {
  var task = new MapUpdateTask(
      files,
      this.loaders,
      map,
      {
        maxOpenFiles: this.options.maxOpenFiles,
        maxProcesses: this.options.maxProcesses
      });

  var events = [
    'found',
    'changed',
    'analyzed',
    'mapUpdated',
    'postProcessed',
    'complete'
  ];

  var me = this;
  events.forEach(function(name) {
    task.on(name, function(value) {
      me.emit(name, value);
    });
  });

  return task;
};

/**
 * @return {FileFinder}
 */
Neo.prototype.getFinder = function() {
  if (!this.finder) {
    var ext = {};
    this.loaders.forEach(function(loader) {
      loader.getExtensions().forEach(function(e) {
        ext[e] = true;
      });
    });
    this.finder = new FileFinder({
      scanDirs: this.scanDirs,
      extensions: Object.keys(ext),
      useNative: this.options.useNativeFind,
      ignore: this.options.ignorePaths
    });
  }
  return this.finder;
};

/**
 * @return {MapSerializer}
 */
Neo.prototype.getSerializer = function() {
  return this.serializer || new MapSerializer(
          this.loaders,
          { version: this.options.version });
};

Neo.Loaders = loaders;

// 导出
module.exports = Neo;