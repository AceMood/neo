/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file Produce Original ResourceMap.
 *     neo.update trigger events below in order:
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

const EventEmitter = require('events').EventEmitter;
const log = require('et-util-logger');
const utils = require('./util');
const checker = require('./core/checker');
const ResourceMap = require('./core/ResourceMap');
const Finder = require('./core/Finder');
const MapUpdateTask = require('./core/MapUpdateTask');
const MapSerializer = require('./core/MapSerializer');
const loaders = require('./loaders');

/**
 * @param {?LogLevel=} level
 * @return {Logger}
 */
function getLogger(level) {
  return new log.Logger(level);
}

class Neo extends EventEmitter {
  /**
   * Register
   * @param {string} name 加载器名称
   * @param {ResourceLoader} ResourceLoader 加载器实现
   */
  static registerResourceLoader(name, ResourceLoader) {
    loaders[name] = ResourceLoader;
  }

  /**
   * Undo
   * @param {string} name
   * @returns {boolean}
   */
  static unregisterResourceLoader(name) {
    return delete loaders[name];
  }

  /**
   * @param {Array.<ResourceLoader>} loaders  预置加载器的实例
   * @param {Array.<string>} scanDirs 要扫描的目录数组, 位置相对于当前执行目录.
   * @param {?object} options
   *   options fields：
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
    this.finder = this.getFinder();
    this.serializer = this.options.serializer || new MapSerializer(this.loaders, { version: this.options.version });
    this.logger = getLogger(this.options.logLevel || log.Level.ALL);
    // make logger globally
    if (!global.logger) {
      global.logger = this.logger;
    }
  }

  /**
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

    this.finder.find(f => {
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
          logger.error(`Circular dependency occurred! Start from: ${ msg }`);
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
    this.finder.find(files => {
      this.createUpdateTask(files, map).on('complete', callback).run();
    });
  }

  /**
   * 异步加载资源表若没有则创建一个
   * @param {string} path
   * @param {function} callback
   */
  loadOrCreateMap(path, callback) {
    this.serializer.load(path, (err, map) => {
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
    this.serializer.store(path, map, callback);
  }

  /**
   * Create MapUpdateTask
   * @param  {Array} files
   * @param  {ResourceMap} map
   * @return {MapUpdateTask}
   */
  createUpdateTask(files, map) {
    let task = new MapUpdateTask(files, this.loaders, map, {
      maxOpenFiles: this.options.maxOpenFiles,
      maxProcesses: this.options.maxProcesses
    });

    let events = ['changed', 'analyzed', 'mapUpdated', 'postProcessed', 'complete'];

    let neo = this;
    events.forEach(name => {
      task.on(name, value => {
        neo.emit(name, value);
      });
    });

    return task;
  }

  /**
   * Return a FileFinder
   * @return {object}
   */
  getFinder() {
    let ext = {};
    this.loaders.forEach(loader => {
      loader.getExtensions().forEach(e => {
        ext[e] = true;
      });
    });
    this.finder = Finder(this.scanDirs, Object.keys(ext), this.options.ignorePaths || utils.fnIgnore, this.options.useNativeFind);
    return this.finder;
  }
}

// exports for external APIs
Object.defineProperty(Neo, 'Loaders', {
  enumerable: true,
  value: loaders
});

Object.defineProperty(Neo, 'Resource', {
  enumerable: true,
  value: require('./resource/Resource')
});

module.exports = Neo;

//# sourceMappingURL=neo-compiled.js.map