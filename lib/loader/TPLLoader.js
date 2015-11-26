/**
 * @file tpl加载器
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var fs = require('fs');

var ResourceLoader = require('./ResourceLoader');
var MessageList = require('../MessageList');
var TPL = require('../resource/TPL');

function TPLLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(TPLLoader, ResourceLoader);

TPLLoader.prototype.path = __filename;

TPLLoader.prototype.matchPath = function(filePath) {
  return this.getExtensions().some(function(ext) {
    return filePath.lastIndexOf(ext) === filePath.length - ext.length;
  });
};

TPLLoader.prototype.getResourceTypes = function() {
  return [TPL];
};

TPLLoader.prototype.getExtensions = function() {
  return ['.tpl'];
};

/**
 * 给定路径创建新资源
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {Function}             callback
 */
TPLLoader.prototype.loadFromPath =
    function(path, configuration, callback) {
      var tpl = new TPL(path);
      var messages = MessageList.create();
      tpl.id = path;
      fs.readFile(path, function(err, buffer) {
        tpl.networkSize = buffer.length;
        callback(messages, tpl);
      });
    };

// 导出
module.exports = TPLLoader;