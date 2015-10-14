/**
 * @fileoverview 打包构建产出资源表。
 * @email zmike86@gmail.com
 */

'use strict';

// imported modules
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var fs = require('fs');
var path = require('path');
var Processsor = require('./processor/factory');
var ResourceMap = require('./resource/ResourceMap');

/**
 * 构建工具门面
 * @constructor
 * @param {Array.<Loader>}  loaders  预置加载器的实例。
 * @param {Array.<String>}  scanDirs 要扫描的目录数组，位置相对于当前执行的js文件。
 * @param {?Object} options          Neo的配置对象。
 *   options可包含以下字段：
 *   {?FileFinder} options.finder 自定义文件扫描器
 *   {?ResourceMapSerializer} options.serializer 自定义序列化资源表
 *   {?Number} options.maxOpenFiles   Maximum number of loaders
 *                                               MapUpdateTask can use
 * @param {Number|null}   options.maxProcesses   Maximum number of loader forks
 *                                               MapUpdateTask can use
 * @param {Boolean|null}  options.useNativeFind  Whether to use native shell
 *                                               find command (faster) or node
 *                                               implementation (safer)
 * @param {function|null} options.ignorePaths    Function to reject paths
 * @param {String|null}   options.version        Version of the cache. If
 *                                               the version mismatches the
 *                                               cached on, cache will be
 *                                               ignored
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
 * 本函数功能:
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
    var task = me.createUpdateTask(files, map).on('complete', function(map) {
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
    }).run();
  };

  this.getFinder().find(function(f) {
    files = f;
    me.emit('found', files);
    run();
  });

  if (options && options.forceRescan) {
    map = new ResourceMap();
  } else {
    this.loadOrCreateMap(path, function(m) {
      map = m;
      me.emit('mapLoaded');
      run();
    });
  }
};

/**
 * @protected
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

// 导出
module.exports = Neo;