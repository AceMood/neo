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

    // 初始化一个ProjectConfigurationLoader, 以便解析项目配置
    this.loaders.forEach(function(loader) {
      if (loader.isConfiguration) {
        this.configurationLoader = loader;
      }
    }, this);

    if (!this.configurationLoader) {
      this.configurationLoader = new ProjectConfigurationLoader();
    }
  }

  /**
   * 执行
   * @returns {MapUpdateTask}
   */
  run() {
    var task = this;
    // 标记改动文件
    task.markChangedFiles(() => {
      // 通知外界改变的文件数据
      task.emit('changed-files', task.changed);
      // 标记改动的config文件
      task.processChangedConfigurations(() => {
        // 通知外界改变的文件数据
        task.emit('changed', task.changed);
        task.analyzeChanged(() => {
          //
          task.emit('analyzed', task.changed);
          // 更新资源表
          task.updateMap(() => {
            // 通知外界已更新资源表
            task.emit('mapUpdated', task.changed);
            // 后处理
            task.postProcess(() => {
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
      var filePath = pair[0];
      var mtime = pair[1];

      visited[filePath] = true;
      var resource = this.map.getResourceByPath(filePath);

      // 统计新加的
      if (!resource) {
        this.markAsChanged(mtime, filePath, null);

      // 统计改动的
      } else if (resource.mtime < mtime) {
        this.markAsChanged(mtime, filePath, resource);
      }
    }, this);

    // 统计删除的
    this.map.getAllResources().forEach(resource => {
      if (!visited[resource.path]) {
        task.markAsChanged(resource.mtime, null, resource);
      }
    });

    // async
    process.nextTick(() => {
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
    changedConfigurations.forEach(record => {
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

      affected.forEach(resource => {
        affectedDirectories.push
          .apply(affectedDirectories, resource.getRoots());
      });

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
    var task = this;

    if (!this.changed.length) {
      callback.call(this);
      return;
    }

    var configurations = this.files
      .filter(pair => task.configurationLoader.matchPath(pair[0]))
      .map(pair => task.newConfigurations[pair[0]]
      || task.map.getResourceByPath(pair[0]));

    var trie = new ConfigurationTrie(configurations);

    // if resource was preloaded earlier just skip
    var paths = this.changed
      .filter(r => !r.newResource && r.newPath)
      .map(r => r.path);

    // 用另外的任务跑这个
    var analyzeTask = new AnalyzeChangedTask(
      this.loaders,
      trie,
      {
        maxOpenFiles: this.maxOpenFiles,
        maxProcesses: this.maxProcesses
      }
    );

    analyzeTask.runOptimaly(paths, function(resources, skipped) {
      resources = resources.filter(r => !!r);
      resources.forEach(resource => {
        var record = task.changedPaths[resource.path];
        if (record) {
          resource.mtime = record.mtime;
          record.newResource = resource;
        }
      });

      task.skipped = skipped;
      callback.call(task);
    });
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

    /**
     * 异步回调函数, loader在执行后处理后会调此函数
     */
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
      callback.call(task);
    });
  }
}


module.exports = MapUpdateTask;