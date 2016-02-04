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
 * @file 扫描目录下的所有文件
 */

/* globals slogger */

'use strict';

var fs = require('fs');
var node_path = require('path');

/**
 * 按照给定的扩展名扫描目录
 * Will not follow symlinks. 用node.js原生的方法去遍历会慢一些但是比用findNative安全些.
 * @param  {Array.<string>} scanDirs   要扫描的目录, ex: ['html']
 * @param  {Array.<string>} extensions 文件扩展名, ex: ['.js']
 * @param  {?function}      ignore     Optional function to filter out paths
 * @param  {function}       callback   回调函数
 * @return {Array.<Array.<string>>}
 */
function findInNode(scanDirs, extensions, ignore, callback) {
  var result = [];
  var activeCalls = 0;

  /**
   * 扫描某个文件
   * @param {string} curFile
   */
  function readFile(curFile) {
    if (ignore && ignore(curFile)) {
      return;
    }
    activeCalls++;

    fs.lstat(curFile, (err, stat) => {
      activeCalls--;

      if (!err && stat && !stat.isSymbolicLink()) {
        if (stat.isDirectory()) {
          readdirRecursive(curFile);
        } else {
          var ext = node_path.extname(curFile);
          // 扩展名符合文件类型
          if (extensions.indexOf(ext) !== -1) {
            result.push([curFile, stat.mtime.getTime()]);
          }
        }
      }
      if (activeCalls === 0) {
        callback(result);
      }
    });
  }

  /**
   * 递归扫描目录下的文件
   * @param {string} curDir
   */
  function readdirRecursive(curDir) {
    activeCalls++;
    fs.readdir(curDir, (err, names) => {
      if (err) {
        slogger.error(
          'Can\'t scan directory ',
          curDir, '. ',
          err.message
        );
        throw err;
      }

      activeCalls--;

      // 标准化文件路径
      for (var i = 0; i < names.length; i++) {
        names[i] = node_path.join(curDir, names[i]);
      }

      names.forEach(curFile => readFile);

      if (activeCalls === 0) {
        callback(result);
      }
    });
  }

  scanDirs.forEach(readdirRecursive);
}

/**
 * 按照给定的扩展名扫描目录（异步操作）
 * Will not follow symlinks. Uses native find shell script. Usually faster than
 * node.js based implementation though as any shell command is suspectable to
 * attacks. Use with caution.
 *
 * @param  {Array.<String>} scanDirs   要扫描的目录, ex: ['html/']
 * @param  {Array.<String>} extensions 文件扩展名, ex: ['.js']
 * @param  {?function}      ignore     Optional function to filter out paths
 * @param  {function}       callback   回调函数
 */
function findInNative(scanDirs, extensions, ignore, callback) {
  var os = require('os');
  if (os.platform() === 'win32') {
    return findInNode(scanDirs, extensions, ignore, callback);
  }

  var spawn = require('child_process').spawn;
  var args = [].concat(scanDirs);
  args.push('-type', 'f');
  extensions.forEach((ext, index) => {
    if (index) {
      args.push('-o');
    }
    args.push('-iname');
    args.push('*' + ext);
  });

  var findProcess = spawn('find', args);
  var stdout = '';
  findProcess.stdout.setEncoding('utf-8');
  findProcess.stdout.on('data', function(data) {
    stdout += data;
  });

  findProcess.stdout.on('close', () => {
    // Split by lines, trimming the trailing newline
    var lines = stdout.trim().split('\n');
    if (ignore) {
      var include = function(x) {
        return !ignore(x);
      };
      lines = lines.filter(include);
    }

    var result = [];
    var count = lines.length;

    lines.forEach(path => {
      fs.stat(path, (err, stat) => {
        if (err) {
          slogger.error(err.message);
          throw err;
        }

        if (stat && !stat.isDirectory()) {
          result.push([path, stat.mtime.getTime()]);
        }
        if (--count === 0) {
          callback(result);
        }
      });
    });
  });
}

/**
 * 工厂函数
 * @param  {Array.<string>} scanDirs   要扫描的目录, ex: ['html']
 * @param  {Array.<string>} extensions 文件扩展名, ex: ['.js']
 * @param  {?function}      ignore     Optional function to filter out paths
 * @param  {boolean}        useNative  是否使用原生命令
 * @return {!object}
 */
function getFinder(scanDirs, extensions, ignore, useNative) {
  var finder = {
    scanDirs: scanDirs || ['.'],
    extensions: extensions || ['.js', '.css'],
    ignore: ignore || null,
    useNative: useNative || false,
    findInNode: findInNode,
    findInNative: findInNative,
    find: find
  };

  /**
   * @param {function} callback
   */
  function find(callback) {
    var impl = finder.useNative ? findInNative : findInNode;
    impl(finder.scanDirs, finder.extensions, finder.ignore, callback);
  }

  return finder;
}

module.exports = getFinder;