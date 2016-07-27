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
 *     analyzed       分析改动的文件
 *     mapUpdated     资源表更新完毕
 *     postProcessed  后处理完毕
 *     complete       扫描任务完成
 *     mapStored      资源表写入缓存
 */

/* globals logger */

'use strict';

const EventEmitter  = require('events').EventEmitter;
const log           = require('et-util-logger');
const utils         = require('./util');
const checker       = require('./core/checker');
const Resource      = require('./resource/Resource');
const ResourceMap   = require('./core/ResourceMap');
const getFinder     = require('./core/getFinder');
const MapUpdateTask = require('./core/MapUpdateTask');
const MapSerializer = require('./core/MapSerializer');
const loaders       = require('./loaders');

/**
 * @param {?LogLevel=} level
 * @return {Logger}
 */
function getLogger(level) {
  return new log.Logger(level);
}

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
   *     checkCircular {boolean=}     是否检查循环依赖, 默认为true
   *     forceRescan   {boolean=}     是否不读取上次扫描缓存, 默认false
   *     ignorePaths   {function:boolean=}  返回是否忽略路径的函数
   *     logLevel      {LogLevel=}    日志输出级别
   *     maxOpenFiles  {number=}      loaders打开文件的最大数目
   *     maxProcesses  {number=}      Maximum number of loader forks MapUpdateTask can use
   *     serializer    {MapSerializer=}  自定义序列化资源表
   *     useNativeFind {boolean=}     使用linux系统的shell命令还是node实现的方法
   *     version       {string=}      缓存的版本. 如果版本和缓存不一致则忽略缓存
   */
  constructor(loaders, scanDirs, options) {
    super();

    this.loaders = loaders;
    this.scanDirs = scanDirs;
    this.options = options || {};
    this.finder = null;
    this.serializer = this.options.serializer || null;
    // 记录输出
    this.logger = getLogger(this.options.logLevel || log.Level.ALL);
    // 写到全局
    if (!global.logger) {
      global.logger = this.logger;
    }
  }

  /**
   * 本函数:
   *  1) load cache if exists
   *  2) compare to the existing files
   *  3) analyze changes
   *  4) update map
   *  5) write cache back to disk
   *  6) return map
   *
   * @param {string}   path 资源表打印路径
   * @param {function} callback 升级后回调函数
   * @param {?object}  options 配置对象
   */
  update(path, callback, options) {
    let map, files;
    let neo = this;

    /**
     * 扫描资源后执行升级任务
     */
    function update() {
      if (!map || !files) {
        return;
      }
      let task = neo.createUpdateTask(files, map);
      task.on('complete', map => {
        // 首先检查循环依赖
        if (neo.options.checkCircular !== false) {
          neo.checkCircular(map);
        }

        // 只在发生变化后写入资源表
        let mapChanged = task.changed.length > task.skipped.length;
        if (mapChanged) {
          neo.storeMap(path, map, () => {
            neo.emit('mapStored');
            callback(map);
          });
        } else {
          callback(map);
        }
      }).run();
    }

    this.getFinder().find(f => {
      files = f;
      // 找到所有的静态文件
      neo.emit('found', files);
      update();
    });

    // 强制创建资源表
    if (options && options.forceRescan) {
      map = new ResourceMap();
    } else {
      this.loadOrCreateMap(path, m => {
        map = m;
        // 加载资源表缓存成功
        neo.emit('mapLoaded');
        update();
      });
    }
  }

  /**
   * 检查资源表中的循环依赖
   * @param {ResourceMap} map
   */
  checkCircular(map) {
    // 构建简版资源表
    let localResourceMap = {};
    map.getAllResources().forEach(resource => {
      if (resource.type === 'js') {
        localResourceMap[resource.id] = resource.requiredModules;
      } else if (resource.type === 'css') {
        localResourceMap[resource.id] = resource.requiredCSS;
      }
    });
    // 检查
    let visited = {};
    map.getAllResources().forEach(resource => {
      if (resource.type === 'js' || resource.type === 'css') {
        let stack = [];
        checker.checkCircular(localResourceMap, resource.id, visited, stack);
        if (stack.length !== 0) {
          let msg = stack.join('\n');
          logger.error(`Circular dependency occurred! Start from: ${msg}`);
          process.exit(0);
        }
      }
    });
  }

  /**
   * 更新资源表, 传入回调函数, 但是也必须传入资源表对象.
   * @param {ResourceMap} map
   * @param {function} callback
   */
  updateMap(map, callback) {
    // files数组包含文件名和mtime
    this.getFinder().find(files => {
      this.createUpdateTask(files, map)
        .on('complete', callback)
        .run();
    });
  }

  /**
   * 异步加载资源表若没有则创建一个
   * @param {string} path
   * @param {function} callback
   */
  loadOrCreateMap(path, callback) {
    this.getSerializer().loadFromPath(path, (err, map) => {
      if (err) {
        logger.warn('Load cache error ' + err.message);
      }
      callback(map || new ResourceMap());
    });
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
    let task = new MapUpdateTask(files, this.loaders, map, {
      maxOpenFiles: this.options.maxOpenFiles,
      maxProcesses: this.options.maxProcesses
    });

    let events = [
      'changed',
      'analyzed',
      'mapUpdated',
      'postProcessed',
      'complete'
    ];

    let neo = this;
    events.forEach(name => {
      task.on(name, value => {
        neo.emit(name, value);
      });
    });

    return task;
  }

  /**
   * 返回一个文件扫描器, 见: `./FileFinder.js`
   * @return {object}
   */
  getFinder() {
    if (!this.finder) {
      let ext = {};
      this.loaders.forEach(loader => {
        loader.getExtensions().forEach(e => {
          ext[e] = true;
        });
      });
      this.finder = getFinder(
        this.scanDirs,
        Object.keys(ext),
        this.options.ignorePaths || utils.fnIgnore,
        this.options.useNativeFind
      );
    }
    return this.finder;
  }

  /**
   * @return {MapSerializer}
   */
  getSerializer() {
    return this.serializer || new MapSerializer(
        this.loaders,
        { version: this.options.version }
      );
  }
}

// 导出一些三方可能会用到的配置
Neo.Loaders = loaders;
Neo.Resource = Resource;

module.exports = Neo;