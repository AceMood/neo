/**
 * @fileoverview 图片资源类
 * @email zmike86@gmail.com
 */

'use strict';

var path = require('path');
var fs = require('fs');
var utils = require('../utils');
var ResourceBase = require('./ResourceBase');


/**
 * 单个图片资源类.
 * @constructor
 */
function Image (config) {
  ResourceBase.call(this, config);
  this.getHashId();
}

utils.inherits(Image, ResourceBase);


/**
 * 生成目标文件
 */
ImageResource.prototype.createFile = function () {
  var ext = path.extname(this.original);

  // 写入文件
  soi.fs.mkdir(this.dist);

  var p = this.dist + '/' + this.hashId + ext;
  soi.log.info('Create file located at:\n  ' + p);
  soi.fs.writeFile(p, this.cachedContent);
  // 不存储缓存内容
  delete this.cachedContent;
};


/**
 * 返回当前资源的hash值
 * @return {String}
 */
Image.prototype.getHashId = function () {
  var ret = utils.getFileHash(this.original, null);
  this.hashId = ret.base64;
  this.shortHashId = utils.getStringHash(this.from, 5).base64;
  this.cachedContent = ret.content;
  // 事先无法知道to的具体值，在这里更新
  this.to = soi.utils.normalizeSysPath(
      path.join(path.dirname(this.to), this.hashId + path.extname(this.to)));
};


/**
 * Resource for *.png, *.jpg, *.gif files
 * @extends {Resource}
 * @class
 * @param {String} path path of the resource
 */
function Image(path) {
  Resource.call(this, path);
  this.id = null;
}

Image.prototype.width = 0;
Image.prototype.height = 0;
Image.prototype.type = 'Image';
Image.prototype.version = '0.1';

Image.fromObject = function(obj) {
  var image = new Image(obj.path);
  image.path = obj.path;
  image.width = obj.width || 0;
  image.height = obj.height || 0;
  image.mtime = obj.mtime;
  return image;
};

Image.prototype.toObject = function() {
  var obj = {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };
  if (this.width) {
    obj.width = this.width;
  }
  if (this.height) {
    obj.height = this.height;
  }
  return obj;
};

// 导出
module.exports = Image;
