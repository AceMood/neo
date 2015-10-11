
var fs = require('fs');
var path = require('path');

/**
 * 按照给定的扩展名扫描目录（异步操作）。
 * Will not follow symlinks. 用node.js原生的方法去遍历会慢一些但是比用findNative安全些。
 *
 * @param  {Array.<String>} scanDirs   要扫描的目录, ex: ['html/']
 * @param  {Array.<String>} extensions 文件扩展名, ex: ['.js']
 * @param  {function|null}  ignore     Optional function to filter out paths
 * @param  {Function}       callback   回调函数
 */
function find (scanDirs, extensions, ignore, callback) {
  var result = [];
  var activeCalls = 0;

  function readdirRecursive (curDir) {
    activeCalls++;
    fs.readdir(curDir, function (err, names) {
      activeCalls--;

      // 标准化文件路径
      for (var i = 0; i < names.length; i++) {
        names[i] = path.join(curDir, names[i]);
      }

      names.forEach(function (curFile) {
        if (ignore && ignore(curFile)) {
          return;
        }
        activeCalls++;

        fs.lstat(curFile, function (err, stat) {
          activeCalls--;

          if (!err && stat && !stat.isSymbolicLink()) {
            if (stat.isDirectory()) {
              readdirRecursive(curFile);
            } else {
              var ext = path.extname(curFile);
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
      });

      if (activeCalls === 0) {
        callback(result);
      }
    });
  }

  scanDirs.forEach(readdirRecursive);
}

/**
 * Scans directories for files with given extensions (async)
 * Will not follow symlinks. Uses native find shell script. Usually faster than
 * node.js based implementation though as any shell command is suspectable to
 * attacks. Use with caution.
 *
 * @param  {Array.<String>} scanDirs   要扫描的目录, ex: ['html/']
 * @param  {Array.<String>} extensions 文件扩展名, ex: ['.js']
 * @param  {function|null}  ignore     Optional function to filter out paths
 * @param  {Function}       callback   回调函数
 */
function findNative (scanDirs, extensions, ignore, callback) {
  var os = require('os');
  if (os.platform() == 'win32') {
    return find(scanDirs, extensions, ignore, callback);
  }

  var spawn = require('child_process').spawn;
  var args = [].concat(scanDirs);
  args.push('-type', 'f');
  extensions.forEach(function (ext, index) {
    if (index) {
      args.push('-o');
    }
    args.push('-iname');
    args.push('*' + ext);
  });

  var findProcess = spawn('find', args);
  var stdout = '';
  findProcess.stdout.setEncoding('utf-8');
  findProcess.stdout.on('data', function (data) {
    stdout += data;
  });

  findProcess.stdout.on('close', function (code) {
    // Split by lines, trimming the trailing newline
    var lines = stdout.trim().split('\n');
    if (ignore) {
      var include = function (x) {
        return !ignore(x);
      };
      lines = lines.filter(include);
    }
    var result = [];
    var count = lines.length;
    // for (var i = 0; i < count; i++) {
    //   if (lines[i]) {
    //     var stat = fs.statSync(lines[i]);
    //     if (stat) {
    //       result.push([lines[i], stat.mtime.getTime()]);
    //     }
    //   }
    // }
    // callback(result);
    lines.forEach(function (path) {
      fs.stat(path, function (err, stat) {
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
 * Wrapper for options for a find call
 * @class
 * @param {Object} options
 */
function FileFinder (options) {
  this.scanDirs = options && options.scanDirs || ['.'];
  this.extensions = options && options.extensions || ['.js'];
  this.ignore = options && options.ignore || null;
  this.useNative = options && options.useNative || false;
}

/**
 * @param  {Function} callback
 */
FileFinder.prototype.find = function (callback) {
  var impl = this.useNative ? findNative : find;
  impl(this.scanDirs, this.extensions, this.ignore, callback);
};


module.exports = FileFinder;
module.exports.find = find;
module.exports.findNative = findNative;