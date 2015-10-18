/**
 * @fileoverview 表示更新资源表的任务类
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var ProjectConfigurationLoader =
    require('./loader/ProjectConfigurationLoader');
var ConfigurationTrie = require('./ConfigurationTrie');
var MessageList = require('./MessageList');
var AnalyzeChangedTask = require('./AnalyzeChangedTask');

/**
 * 表示资源表更新的任务。
 * @constructor
 * @extends {EventEmitter}
 *
 * @param {Array}                  files FileFinder返回的文件数组
 * @param {Array.<ResourceLoader>} loaders 资源加载器数组
 * @param {ResourceMap}            map 资源表
 * @param {?Object}                options
 */
function MapUpdateTask(files, loaders, map, options) {
  EventEmitter.call(this);

  this.files = files.map(function(file) {
    file[0] = path.normalize(file[0]);
    return file;
  });
  this.map = map;
  this.loaders = loaders;
  this.configurationLoader = null;
  this.maxOpenFiles = options && options.maxOpenFiles || 200;
  this.maxProcesses = options && options.maxProcesses || 1;

  this.messages = MessageList.create();
  //
  this.changed = [];
  //
  this.changedPaths = {};
  this.newConfigurations = {};
  this.skipped = [];

  // setup ProjectConfigurationLoader, so that MapUpdateTask can resolve
  // configurations
  this.loaders.forEach(function(loader) {
    if (loader.isConfiguration) {
      this.configurationLoader = loader;
    }
  }, this);
  
  if (!this.configurationLoader) {
    this.configurationLoader = new ProjectConfigurationLoader();
  }
}

inherits(MapUpdateTask, EventEmitter);

/**
 * 执行任务，更新资源表
 */
MapUpdateTask.prototype.run = function() {
  // 标记改动文件
  this.markChangedFiles(function() {
    this.emit('changed-files', this.changed);
    // 配置文件改了
    this.processChangedConfigurations(function() {
      this.emit('changed', this.changed);
      //
      this.analyzeChanged(function() {
        this.emit('analyzed', this.changed);

        this.updateMap(function() {
          this.emit('mapUpdated', this.changed);
          this.postProcess(function() {
            this.emit('postProcessed', this.map);
            this.emit('complete', this.map);
          });
        });
      });
    });
  });
  return this;
};

/**
 * 将改变的文件维护到this.changed数组
 * @param {String}   mtime
 * @param {String}   newPath
 * @param {Resource} oldResource
 */
MapUpdateTask.prototype.markAsChanged = function(mtime, newPath, oldResource) {
  var filePath = newPath || oldResource.path;
  if (!this.changedPaths[filePath]) {
    this.changed.push(this.changedPaths[filePath] = {
      mtime: mtime,
      newPath: newPath,
      oldResource: oldResource,
      path: filePath
    });
  }
};

/**
 * 遍历FileFinder返回的文件，结合map标记有改变的文件。
 * @param  {Function} callback
 */
MapUpdateTask.prototype.markChangedFiles = function(callback) {
  // 保存访问过的文件
  var visited = {};
  this.files.forEach(function(pair) {
    // 取得文件名和mtime
    var filePath = pair[0];
    var mtime = pair[1];

    visited[filePath] = true;
    var resource = this.map.getResourceByPath(filePath);
    // 通过mtime判断是否更新
    if (!resource) {
      this.markAsChanged(mtime, filePath, null);
    } else if (resource.mtime < mtime) {
      this.markAsChanged(mtime, filePath, resource);
    }
  }, this);

  this.map.getAllResources().forEach(function(resource) {
    if (!visited[resource.path]) {
      this.markAsChanged(resource.mtime, null, resource);
    }
  }, this);
  callback.call(this);
};

/**
 * 标记所有由于配置文件改变受牵连的文件
 * Mark all files touched by changes in configuration
 * @param  {Function} callback
 */
MapUpdateTask.prototype.processChangedConfigurations = function(callback) {
  // 需要重新解析的package.json
  var toLoad = [];
  var affected = [];

  // 找出变化的配置文件
  var changedConfigurations = this.changed.filter(function(record) {
    return this.configurationLoader.matchPath(record.path);
  }, this);

  // 维护toLoad和affected
  changedConfigurations.forEach(function(record) {
    if (record.newPath) {
      toLoad.push(record);
    }
    if (record.oldResource) {
      affected.push(record.oldResource);
    }
  });

  var next = function() {
    var affectedDirectories = [];
    affected.forEach(function(resource) {
      affectedDirectories.push
          .apply(affectedDirectories, resource.getRoots());
    }, this);
    if (affectedDirectories.length) {
      var regex = new RegExp('^' + '(' + affectedDirectories.join('|').replace('\\','\\\\') + ')');
      this.files.forEach(function(pair) {
        if (regex.test(pair[0])) {
          this.markAsChanged(
              pair[1],
              pair[0],
              this.map.getResourceByPath(pair[0]));
        }
      }, this);
    }
    callback.call(this);
  }.bind(this);

  if (toLoad.length) {
    var waiting = toLoad.length;
    var me = this;
    toLoad.forEach(function(record) {
      this.configurationLoader
          .loadFromPath(record.newPath, null, function(messages, resource) {
            resource.mtime = record.mtime;
            record.newResource = resource;
            me.newConfigurations[resource.path] = resource;
            me.messages.mergeAndRecycle(messages);
            affected.push(resource);
            if (--waiting === 0) {
              next();
            }
          });
    }, this);
  } else {
    next();
  }
};

/**
 * Parse and analyze changed files
 * @protected
 * @param  {Function} callback
 */
MapUpdateTask.prototype.analyzeChanged = function(callback) {
  if (!this.changed.length) {
    callback.call(this);
    return;
  }

  var configurations = this.files.filter(function(pair) {
    return this.configurationLoader.matchPath(pair[0]);
  }, this).map(function(pair) {
    return this.newConfigurations[pair[0]] ||
        this.map.getResourceByPath(pair[0]);
  }, this);

  var trie = new ConfigurationTrie(configurations);

  // if resource was preloaded earlier just skip
  var paths = this.changed.filter(function(record) {
    return !record.newResource && record.newPath;
  }).map(function(r) {
    return r.path;
  });

  var task = new AnalyzeChangedTask(
      this.loaders,
      trie,
      {
        maxOpenFiles: this.maxOpenFiles,
        maxProcesses: this.maxProcesses
      });

  task.runOptimaly(paths, function(messages, resources, skipped) {
    this.messages.mergeAndRecycle(messages);
    resources = resources.filter(function(r) { return !!r; });
    resources.forEach(function(resource) {
      var record = this.changedPaths[resource.path];
      if (record) {
        resource.mtime = record.mtime;
        record.newResource = resource;
      }
    }, this);

    this.skipped = skipped;
    callback.call(this);
  }.bind(this));
};

MapUpdateTask.prototype.postProcess = function(callback) {
  var waiting = 0;
  var me = this;
  var toPostProcess = this.loaders.map(function() {
    return [];
  });
  var loaders = this.loaders;

  this.changed.forEach(function(record) {
    if (record.newResource) {
      for (var i = 0; i < loaders.length; i++) {
        if (loaders[i].matchPath(record.path)) {
          toPostProcess[i].push(record.newResource);
          break;
        }
      }
    }
  });

  function finished(messages) {
    me.messages.mergeAndRecycle(messages);
    if (--waiting === 0) {
      callback.call(me);
    }
  }
  waiting = toPostProcess.length;

  toPostProcess.forEach(function(resources, index) {
    loaders[index].postProcess(this.map, resources, finished);
  }, this);

  if (waiting === 0) {
    callback.call(this);
  }
};

/**
 * Update existing map with the changes
 * @param  {Function} callback
 */
MapUpdateTask.prototype.updateMap = function(callback) {
  this.changed.forEach(function(record) {
    if (!record.newPath) {
      this.map.removeResource(record.oldResource);
    } else if (record.newResource && record.oldResource) {
      this.map.updateResource(record.oldResource, record.newResource);
    } else if (record.newResource) {
      this.map.addResource(record.newResource);
    }
  }, this);
  callback.call(this);
};

// 导出
module.exports = MapUpdateTask;