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
 * @file
 * @author
 */

'use strict';

const node_path = require('path');

class AnalyzeChangedTask {
  /**
   * 这个函数在真实场景下才会测试到.
   * 放弃使用ResourceLoader.fromObject.
   * @param {object} object
   */
  static fromObject(object) {
    // var ResourceLoader = require('./loader/ResourceLoader');
    // var loaders = object.loaders.map(ResourceLoader.fromObject, this);
    let loaders = object.loaders;
    let ConfigurationTrie = require('../ConfigurationTrie');
    let trie = ConfigurationTrie.fromObject(object.trie);

    return new AnalyzeChangedTask(
      loaders,
      trie,
      {
        maxOpenFiles: object.maxOpenFiles,
        maxProcesses: object.maxProcesses
      }
    );
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
      //loaders: this.loaders.map(l => l.toObject()),
      loaders: this.loaders,
      trie: this.configurationTrie.toObject(),
      maxOpenFiles: this.maxOpenFiles,
      maxProcesses: this.maxProcesses
    };
  }

  /**
   *
   * @param {number} n
   * @param {Array.<string>} paths 变化文件的路径
   * @param {function} callback
   */
  runInForks(n, paths, callback) {
    let buckets = [];
    let waiting = n;
    for (let i = 0; i < n; i++) {
      buckets[i] = [];
    }
    paths.forEach((path, i) => {
      buckets[i % n].push(path);
    });

    let skipped = [];
    let resources = [];
    let complete = function() {
      if (--waiting === 0) {
        callback(resources, skipped);
      }
    };

    let typeMap = {};
    this.loaders.forEach(loader => {
      loader.getResourceTypes().forEach(type => {
        typeMap[type.prototype.type] = type;
      });
    });

    let cp = require('child_process');
    buckets.forEach(function() {
      // 启动子进程
      let child = cp.fork(__dirname + '/analyze-changed.js', [], {
        // Passing --debug to child processes interferes with the --debug socket
        // of the parent process.
        execArgv: process.execArgv.filter(function(arg) {
          return arg.indexOf('--debug') === -1;
        })
      });

      child.on('message', function(m) {
        m.resources.forEach(obj => {
          let type = typeMap[obj.type];
          resources.push(type.fromObject(obj));
        });
        skipped = skipped.concat(m.skipped);
        if (paths.length === 0) {
          child.send({ exit: 1 });
          complete();
        } else {
          let chunkSize = Math.min(
            this.maxOpenFiles,
            Math.ceil(paths.length / n)
          );
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
    let n = Math.min(
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
    let trie = this.configurationTrie;
    let loaders = this.loaders;
    let maxOpenFiles = this.maxOpenFiles;

    // 计数需要解析的文件
    let waiting = paths.length;
    let active = 0;
    let next;
    // 记录解析过的文件资源
    let result = [];
    // 由于没有找到相应的loader而被跳过的资源
    let skipped = [];

    /**
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
        let path = paths.shift();

        // 寻找合适的loader
        let loader = null;
        for (let i = 0; i < loaders.length; i++) {
          if (loaders[i].matchPath(path)) {
            loader = loaders[i];
            break;
          }
        }

        if (loader) {
          active++;
          let configuration = trie.findConfiguration(node_path.normalize(path));
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