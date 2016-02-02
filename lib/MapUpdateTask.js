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
 * @file 更新资源表的任务
 * @author AceMood
 */

'use strict';

var node_path = require('path');
var EventEmitter = require('events').EventEmitter;

var ProjectConfigurationLoader =
    require('./loader/ProjectConfigurationLoader');
var ConfigurationTrie = require('./ConfigurationTrie');
var AnalyzeChangedTask = require('./AnalyzeChangedTask');

class MapUpdateTask extends EventEmitter {
  /**
   * 表示资源表更新的任务
   * @param {Array}                  files Finder返回的文件数组
   * @param {Array.<ResourceLoader>} loaders 资源加载器数组
   * @param {ResourceMap}            map 资源表
   * @param {?object}                options
   */
  constructor(files, loaders, map, options) {
    super();

    // 标准化路径
    this.files = files.map(file => {
      file[0] = node_path.normalize(file[0]);
      return file;
    });
    this.map = map;
    this.loaders = loaders;
    this.configurationLoader = null;
    this.maxOpenFiles = options && options.maxOpenFiles || 200;
    this.maxProcesses = options && options.maxProcesses || 1;

    // 保存有变动的文件数据
    this.changed = [];
    // 按照变化的路径保存文件数据
    this.changedPaths = {};
    // 保存受影响的新configuration对象
    this.newConfigurations = {};

    this.skipped = [];

    // 初始化一个ProjectConfigurationLoader, 以便MapUpdateTask解析项目配置
    this.loaders.forEach(function(loader) {
      if (loader.isConfiguration) {
        this.configurationLoader = loader;
      }
    }, this);

    if (!this.configurationLoader) {
      this.configurationLoader = new ProjectConfigurationLoader();
    }
  }

  run() {
    var task = this;
    // 标记改动文件
    task.markChangedFiles(function() {
      // 通知外界改变的文件数据
      task.emit('changed-files', task.changed);
      // 标记改动的config文件
      task.processChangedConfigurations(function() {
        // 通知外界改变的文件数据
        task.emit('changed', task.changed);
        task.analyzeChanged(function() {
          //
          task.emit('analyzed', task.changed);
          // 更新资源表
          task.updateMap(function() {
            // 通知外界已更新资源表
            task.emit('mapUpdated', task.changed);
            // 后处理
            task.postProcess(function() {
              task.emit('postProcessed', task.map);
              task.emit('complete', task.map);
            });
          });
        });
      });
    });

    return this;
  }

  /**
   * 将改变的文件维护到this.changed数组
   * @param {string}    mtime
   * @param {?string}   newPath 新的资源路径, 若被删除则是null
   * @param {?Resource} oldResource 老的资源对象, 若新建的则是null
   */
  markAsChanged(mtime, newPath, oldResource) {
    var filePath = newPath || oldResource.path;
    if (!this.changedPaths[filePath]) {
      this.changed.push(this.changedPaths[filePath] = {
        mtime: mtime,
        newPath: newPath,
        oldResource: oldResource,
        path: filePath
      });
    }
  }

  /**
   * 遍历FileFinder返回的文件, 结合map标记有改变的文件.
   * @param {function} callback
   */
  markChangedFiles(callback) {
    var task = this;
    // 保存访问过的文件
    var visited = {};
    task.files.forEach(function(pair) {
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

    // async
    process.nextTick(function() {
      callback.call(task);
    });
  }

  /**
   * 标记所有由于配置文件改变受牵连的文件
   * Mark all files touched by changes in configuration
   * @param {function} callback
   */
  processChangedConfigurations(callback) {
    // 需要重新解析的package.json
    var toLoad = [];
    // 受影响的老配置resource
    var affected = [];

    // 找出变化的配置文件
    var changedConfigurations = this.changed.filter(function(record) {
      return this.configurationLoader.matchPath(record.path);
    }, this);

    // 维护toLoad和affected
    changedConfigurations.forEach(function(record) {
      // 资源没被删除, 而是文件有变化
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
          .loadFromPath(record.newPath, null, function(resource) {
            resource.mtime = record.mtime;
            record.newResource = resource;

            // 保存新的配置资源
            me.newConfigurations[resource.path] = resource;

            affected.push(resource);
            if (--waiting === 0) {
              next();
            }
          });
      }, this);
    } else {
      next();
    }
  }

  /**
   * Parse and analyze changed files
   * @param {function} callback
   */
  analyzeChanged(callback) {
    if (!this.changed.length) {
      callback.call(this);
      return;
    }

    var configurations = this.files
      .filter(function(pair) {
        return this.configurationLoader.matchPath(pair[0]);
      }, this)
      .map(function(pair) {
        return this.newConfigurations[pair[0]] ||
          this.map.getResourceByPath(pair[0]);
      }, this);

    var trie = new ConfigurationTrie(configurations);

    // if resource was preloaded earlier just skip
    var paths = this.changed
      .filter(function(record) {
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

    task.runOptimaly(paths, function(resources, skipped) {
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
  }

  /**
   * 扫描后处理
   * @param {function} callback
   */
  postProcess(callback) {
    var waiting = 0;
    var task = this;
    var loaders = this.loaders;

    // toPostProcess.length代表了需要加载几种资源
    var toPostProcess = loaders.map(() => []);

    function finished() {
      if (--waiting === 0) {
        callback.call(task);
      }
    }

    this.changed.forEach(record => {
      if (record.newResource) {
        for (var i = 0; i < loaders.length; i++) {
          if (loaders[i].matchPath(record.path)) {
            toPostProcess[i].push(record.newResource);
            break;
          }
        }
      }
    });

    waiting = toPostProcess.length;

    toPostProcess.forEach((resources, index) => {
      loaders[index].postProcess(task.map, resources, finished);
    });

    if (waiting === 0) {
      callback.call(task);
    }
  }

  /**
   * 根据变化的文件更新资源表
   * @param {function} callback
   */
  updateMap(callback) {
    var task = this;
    task.changed.forEach(function(record) {
      if (!record.newPath) {
        this.map.removeResource(record.oldResource);
      } else if (record.newResource && record.oldResource) {
        this.map.updateResource(record.oldResource, record.newResource);
      } else if (record.newResource) {
        this.map.addResource(record.newResource);
      }
    }, this);

    // async
    process.nextTick(() => {
      callback.call(task)
    });
  }
}


module.exports = MapUpdateTask;