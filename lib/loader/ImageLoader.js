/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 图像加载器
 * @author AceMood
 */

/* globals logger */

'use strict';

var fs = require('fs');
var ResourceLoader = require('./ResourceLoader');
var Image = require('../resource/Image');
var getImageSize = require('../parser/getImageSize');

const re = /\.(jpg|jpeg|gif|png|webp|bmp)$/;

class ImageLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {ImageLoader}
   */
  static fromObject(object) {
    return new ImageLoader(object.options);
  }

  /**
   * @param {?object} options Object with the following options:
   */
  constructor(options) {
    super(options);
  }

  getResourceTypes() {
    return [Image];
  }

  getExtensions() {
    return ['.jpg', 'jpeg', '.png', '.gif', '.webp', '.bmp'];
  }

  /**
   * 给定路径创建新资源
   * @protected
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {function}             callback
   */
  loadFromPath(path, configuration, callback) {
    let image = new Image(path);
    image.id = path;
    fs.readFile(path, (err, buffer) => {
      if (err) {
        logger.error(
          'Reading file at:  ' + path,
          err.message
        );
        throw err;
      } else {
        image.networkSize = buffer.length;
        image.setContent(buffer.toString(image.encoding));

        let size = getImageSize(buffer);
        if (size) {
          image.width = size.width;
          image.height = size.height;
        }

        callback(image);
      }
    });
  }

  /**
   * @param  {string} filePath
   * @return {boolean}
   */
  matchPath(filePath) {
    return re.test(filePath);
  }
}

module.exports = ImageLoader;