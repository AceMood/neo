/**
 * @file *.swf文件加载器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var fs = require('fs');

var ResourceLoader = require('./ResourceLoader');
var MessageList = require('../MessageList');
var SWF = require('../resource/SWF');

/**
 * @param {Object|null} options Object with the following options:
 * @constructor
 * @extends {ResourceLoader}
 */
function SWFLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(SWFLoader, ResourceLoader);

SWFLoader.prototype.path = __filename;

SWFLoader.prototype.matchPath = function(filePath) {
  return filePath.lastIndexOf('.swf') === filePath.length - 4;
};

SWFLoader.prototype.getResourceTypes = function() {
  return [SWF];
};

SWFLoader.prototype.getExtensions = function() {
  return ['.swf'];
};

/**
 * 给定路径创建新资源
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {Function}             callback
 */
SWFLoader.prototype.loadFromPath =
    function(path, configuration, callback) {
      var me = this;
      var swf = new SWF(path);
      var messages = MessageList.create();
      swf.id = path;
      fs.readFile(path, function(err, buffer) {
        swf.networkSize = buffer.length;
        swf.setContent(buffer.toString());
        callback(messages, swf);
      });
    };

// 导出
module.exports = SWFLoader;