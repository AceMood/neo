/**
 * @file *.swf文件加载器
 */

'use strict';

var inherits = require('util').inherits;
var fs = require('fs');

var ResourceLoader = require('./ResourceLoader');
var MessageList = require('../MessageList');
var SWF = require('../resource/SWF');

function SWFLLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(SWFLLoader, ResourceLoader);

SWFLLoader.prototype.path = __filename;

SWFLLoader.prototype.matchPath = function(filePath) {
  return filePath.lastIndexOf('.swf') === filePath.length - 4;
};

SWFLLoader.prototype.getResourceTypes = function() {
  return [SWF];
};

SWFLLoader.prototype.getExtensions = function() {
  return ['.swf'];
};

/**
 * 给定路径创建新资源
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {Function}             callback
 */
SWFLLoader.prototype.loadFromPath =
    function(path, configuration, callback) {
      var swf = new SWF(path);
      var messages = MessageList.create();
      swf.id = path;
      fs.readFile(path, function(err, buffer) {
        swf.networkSize = buffer.length;
        callback(messages, swf);
      });
    };

// 导出
module.exports = SWFLLoader;