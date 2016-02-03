/**
 * @file
 */

'use strict';

var node_path = require('path');

class AnalyzeChangedTask {
  /**
   *
   * @param object
   */
  static fromObject(object) {
    var ResourceLoader = require('./loader/ResourceLoader');
    var loaders = object.loaders.map(ResourceLoader.fromObject, this);
    var ConfigurationTrie = require('./ConfigurationTrie');
    var trie = ConfigurationTrie.fromObject(object.trie);
    return new AnalyzeChangedTask(loaders, trie, {
      maxOpenFiles: object.maxOpenFiles
    });
  }

  /**
   * @param {Array.<ResourceLoader>} loaders
   * @param {ConfigurationTrie} configurationTrie
   * @param {?object=} options
   */
  constructor(loaders, configurationTrie, options) {
    this.loaders = loaders;
    this.configurationTrie = configurationTrie;
    this.maxOpenFiles = options && options.maxOpenFiles || 200;
    this.maxProcesses = options && options.maxProcesses || 4;
  }

  toObject() {
    return {
      loaders: this.loaders.map(l => l.toObject()),
      trie: this.configurationTrie.toObject(),
      maxOpenFiles: this.maxOpenFiles
    };
  }

  /**
   *
   * @param {number} n
   * @param {Array.<string>} paths 变化文件的路径
   * @param {function} callback
   */
  runInForks(n, paths, callback) {
    var buckets = [];
    var waiting = n;
    for (var i = 0; i < n; i++) {
      buckets[i] = [];
    }
    paths.forEach((path, i) => {
      buckets[i % n].push(path);
    });

    var skipped = [];
    var resources = [];
    var complete = function() {
      if (--waiting === 0) {
        callback(resources, skipped);
      }
    };

    var typeMap = {};
    this.loaders.forEach(loader => {
      loader.getResourceTypes().forEach(type => {
        typeMap[type.prototype.type] = type;
      });
    });

    var cp = require('child_process');
    buckets.forEach(function() {
      // 启动子进程
      var child = cp.fork(__dirname + '/analyze-changed.js', [], {
        // Passing --debug to child processes interferes with the --debug socket
        // of the parent process.
        execArgv: process.execArgv.filter(function(arg) {
          return arg.indexOf('--debug') === -1;
        })
      });

      child.on('message', function(m) {
        m.resources.forEach(function(obj) {
          var type = typeMap[obj.type];
          resources.push(type.fromObject(obj));
        });
        skipped = skipped.concat(m.skipped);
        if (paths.length === 0) {
          child.send({ exit: 1 });
          complete();
        } else {
          var chunkSize = Math.min(
            this.maxOpenFiles,
            Math.ceil(paths.length / n));
          child.send({ paths: paths.splice(0, chunkSize) });
        }
      }.bind(this));

      child.send({
        task: this.toObject(),
        paths: paths.splice(0, this.maxOpenFiles)
      });
    }, this);
  }

  /**
   * 如果变化的文件数过多, 启动子进程计算
   * @param {Array.<string>} paths 变化文件的路径
   * @param {function} callback
   */
  runOptimaly(paths, callback) {
    var n = Math.min(
      this.maxProcesses,
      Math.floor(paths.length / this.maxOpenFiles)
    );

    if (n > 1) {
      this.runInForks(n, paths, callback);
    } else {
      this.run(paths, callback);
    }
  }

  /**
   * 正常单进程跑任务
   * @param {Array.<string>} paths 变化文件的路径
   * @param {function} callback
   */
  run(paths, callback) {
    var trie = this.configurationTrie;
    var loaders = this.loaders;
    var maxOpenFiles = this.maxOpenFiles;

    // 计数需要解析的文件
    var waiting = paths.length;
    var active = 0;
    var next;
    // 记录解析过的文件资源
    var result = [];
    // 由于没有找到相应的loader而被跳过的资源
    var skipped = [];

    /**
     *
     * @param {Resource} resource
     */
    function resourceLoaded(resource) {
      result.push(resource);
      waiting--;
      active--;
      next();
    }

    /**
     * 每一次循环判断任务跑完
     */
    function doAtEnd() {
      if (waiting === 0 && paths.length === 0) {
        callback(result, skipped);
      }
    }

    next = function() {
      while (active < maxOpenFiles && paths.length) {
        var path = paths.shift();

        // 寻找合适的loader
        let loader = null;
        for (var i = 0; i < loaders.length; i++) {
          if (loaders[i].matchPath(path)) {
            loader = loaders[i];
            break;
          }
        }

        if (loader) {
          active++;
          var configuration = trie.findConfiguration(node_path.normalize(path));
          loader.loadFromPath(path, configuration, resourceLoaded);
        } else {
          // if we reached this point the resource was not analyzed because of the
          // missing type
          skipped.push(path);
          waiting--;
        }
      }

      doAtEnd();
    };

    next();
  }
}


module.exports = AnalyzeChangedTask;