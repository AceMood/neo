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
 * @file 打包构建产出资源表.
 *     neo.update依次触发以下事件:
 *     found          Finder扫描完了工程目录
 *     mapLoaded      缓存的.cache序列化成资源表加载完毕
 *     changed        有文件内容有改动
 *     analyzed
 *     mapUpdated     资源表更新完毕
 *     postProcessed  后处理完毕
 *     complete       扫描任务完成
 *     mapStored      资源表写入缓存
 */

'use strict';

let EventEmitter = require('events').EventEmitter;
let fs = require('fs');
let log = require('et-util-logger');

let utils = require('./util');
let Resource = require('./resource/Resource');
let ResourceMap = require('./resource/ResourceMap');
let FileFinder = require('./FileFinder');
let MapUpdateTask = require('./MapUpdateTask');
let MapSerializer = require('./MapSerializer');
let loaders = require('./loaders');

class Neo extends EventEmitter {
  /**
   * 动态注册需要扫描的资源类型
   * @param {string} name 加载器名称
   * @param {ResourceLoader} ResourceLoader 加载器实现
   */
  static registerResourceLoader(name, ResourceLoader) {
    loaders[name] = ResourceLoader;
  }

  /**
   * 注销资源加载器
   * @param {string} name
   * @returns {boolean}
   */
  static unregisterResourceLoader(name) {
    return delete loaders[name];
  }

  /**
   * 构建工具门面
   * @param {Array.<ResourceLoader>} loaders  预置加载器的实例
   * @param {Array.<string>} scanDirs 要扫描的目录数组, 位置相对于当前执行目录.
   * @param {?object} options 配置对象.
   *   options可包含以下字段：
   *     finder {?FileFinder}  自定义文件扫描器
   *     serializer {?MapSerializer}  自定义序列化资源表
   *     logger {Logger=} 日志输出
   *     maxOpenFiles {?number} loaders的最大数目, MapUpdateTask用到
   *     maxProcesses {?number}  Maximum number of loader forks MapUpdateTask can use
   *     useNativeFind {?boolean}  使用linux系统的shell命令(faster)还是node实现的方法(safer)
   *     ignorePaths {?function:boolean}  返回是否忽略路径的函数
   *     version {?string}  缓存的版本. 如果版本和缓存不一致则忽略缓存。
   */
  constructor(loaders, scanDirs, options) {
    super();

    this.loaders = loaders;
    this.scanDirs = scanDirs;
    this.options = options || {};
    this.finder = this.options.finder || null;
    this.serializer = this.options.serializer || null;
    // 记录输出
    this.logger = this.options.logger || slogger || this.getLogger();
    // 写到全局
    global.slogger = this.logger;
  }

  /**
   * 本函数:
   *  1) load cache if exists
   *  2) compare to the existing files
   *  3) analyze changes,
   *  4) update map,
   *  5) write cache back to disk
   *  6) return map
   *
   * @param {string} path 资源表打印路径
   * @param {function} callback 升级后回调函数
   * @param {?object} options 配置对象
   */
  update(path, callback, options) {
    var map, files;
    var me = this;

    var run = function() {
      if (!map || !files) {
        return;
      }
      var task = me.createUpdateTask(files, map)
        .on('complete', map => {
          // only store map if it's changed
          var mapChanged = task.changed.length > task.skipped.length;
          if (mapChanged) {
            me.storeMap(path, map, () => {
              me.emit('mapStored');
              callback(map, task.messages);
            });
          } else {
            callback(map, task.messages);
          }
        })
        .run();
    };

    this.getFinder().find(f => {
      files = f;
      // 找到所有的静态文件
      me.emit('found', files);
      run();
    });

    // 强制创建资源表
    if (options && options.forceRescan) {
      map = new ResourceMap();
    } else {
      this.loadOrCreateMap(path, m => {
        map = m;
        // 加载资源表缓存成功
        me.emit('mapLoaded');
        run();
      });
    }
  }

  /**
   * 更新资源表, 传入回调函数, 但是也必须传入资源表对象.
   * @param {ResourceMap} map
   * @param {function} callback
   */
  updateMap(map, callback) {
    // files数组包含文件名和mtime
    this.getFinder().find(function(files) {
      this.createUpdateTask(files, map)
        .on('complete', callback)
        .run();
    }.bind(this));
  }

  /**
   * 异步加载资源表缓存
   * @param {string} path
   * @param {function} callback
   * @return {?ResourceMap}
   */
  loadMap(path, callback) {
    this.getSerializer().loadFromPath(path, callback);
  }

  /**
   * 同步加载资源表缓存文件
   * @param  {string} path
   * @return {?ResourceMap}
   */
  loadMapSync(path) {
    return this.getSerializer().loadFromPathSync(path);
  }

  /**
   * 异步加载资源表若没有则创建一个
   * @param {string} path
   * @param {function} callback
   */
  loadOrCreateMap(path, callback) {
    this.getSerializer().loadFromPath(path, (err, map) => {
      callback(map || new ResourceMap());
    });
  }

  /**
   * 异步加载资源表若没有则创建一个
   * @param  {string} path
   * @return {ResourceMap}
   */
  loadOrCreateMapSync(path) {
    return this.loadMapSync(path) || new ResourceMap();
  }

  /**
   * 将资源表缓存到本地文件
   * @param {string} path
   * @param {ResourceMap} map
   * @param {function} callback
   */
  storeMap(path, map, callback) {
    this.getSerializer().storeToPath(path, map, callback);
  }

  /**
   * 创建更新资源表的任务，代理向外界分发事件
   * @param  {Array} files
   * @param  {ResourceMap} map
   * @return {MapUpdateTask}
   */
  createUpdateTask(files, map) {
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
  }

  /**
   * @return {FileFinder}
   */
  getFinder() {
    if (!this.finder) {
      var ext = {};
      this.loaders.forEach(function(loader) {
        loader.getExtensions().forEach(e => {
          ext[e] = true;
        });
      });
      this.finder = new FileFinder({
        scanDirs: this.scanDirs,
        extensions: Object.keys(ext),
        useNative: this.options.useNativeFind,
        ignore: this.options.ignorePaths || utils.fnIgnore
      });
    }
    return this.finder;
  }

  /**
   * @return {MapSerializer}
   */
  getSerializer() {
    return this.serializer || new MapSerializer(
        this.loaders,
        { version: this.options.version });
  }

  /**
   * @return {Logger}
   */
  getLogger() {
    return this.logger || new log.Logger();
  }
}

// 导出一些工具会用到的配置
Neo.Loaders = loaders;
Neo.Resource = Resource;

module.exports = Neo;