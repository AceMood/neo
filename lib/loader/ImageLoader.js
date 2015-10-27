/**
 * @fileoverview 图像加载器
 */

'use strict';

var inherits = require('util').inherits;
var fs = require('fs');

var ResourceLoader = require('./ResourceLoader');
var Image = require('../resource/Image');
var MessageList = require('../MessageList');
var getImageSize = require('../parser/getImageSize');

/**
 * @constructor
 * @extends {ResourceLoader}
 */
function ImageLoader(options) {
  ResourceLoader.call(this, options);
}

inherits(ImageLoader, ResourceLoader);
ImageLoader.prototype.path = __filename;

ImageLoader.prototype.getResourceTypes = function() {
  return [Image];
};

ImageLoader.prototype.getExtensions = function() {
  return ['.jpg', '.png', '.gif'];
};

/**
 * Creates a new resource for a given path.
 *
 * @protected
 * @param {String}               path      resource being built
 * @param {ProjectConfiguration} configuration configuration for the path
 * @param {Function}             callback
 */
ImageLoader.prototype.loadFromPath =
  function(path, configuration, callback) {
    var image = new Image(path);
    var messages = MessageList.create();
    image.id = path;
    fs.readFile(path, function(err, buffer) {
      image.networkSize = buffer.length;
      var size = getImageSize(buffer);
      if (size) {
        image.width = size.width;
        image.height = size.height;
      }
      callback(messages, image);
    });
  };

var re = /\.(jpg|gif|png)$/;

/**
 * @static
 * @param  {String} filePath
 * @return {Boolean}
 */
ImageLoader.prototype.matchPath = function(filePath) {
  return re.test(filePath);
};

// 导出
module.exports = ImageLoader;