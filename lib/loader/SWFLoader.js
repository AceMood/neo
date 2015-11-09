/**
 * @file *.swf文件加载器
 */

'use strict';

var inherits = require('util').inherits;

var ResourceLoader = require('./ResourceLoader');

function SWFLLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(SWFLLoader, ResourceLoader);

SWFLLoader.prototype.path = __filename;

SWFLLoader.prototype.matchPath = function(filePath) {
  return filePath.lastIndexOf('.swf') === filePath.length - 4;
};

SWFLLoader.prototype.getExtensions = function() {
  return ['.swf'];
};

// 导出
module.exports = SWFLLoader;