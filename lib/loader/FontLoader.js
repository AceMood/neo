/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 字体文件的加载器
 * @author AceMood
 */

/* globals logger */

'use strict';

var fs = require('fs');
var ResourceLoader = require('./ResourceLoader');
var Font = require('../resource/Font');

const re = /\.(eot|woff|ttf|svg)$/;

class FontLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {FontLoader}
   */
  static fromObject(object) {
    return new FontLoader(object.options);
  }

  /**
   * @param {?object} options Object with the following options:
   */
  constructor(options) {
    super(options);
  }

  getResourceTypes() {
    return [Font];
  }

  getExtensions() {
    return ['.eot', 'woff', '.ttf', '.svg'];
  }

  /**
   * 给定路径创建新资源
   * @protected
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {function}             callback
   */
  loadFromPath(path, configuration, callback) {
    let font = new Font(path);
    font.id = path;
    fs.readFile(path, (err, buffer) => {
      if (err) {
        logger.error(`Reading file at: ${path} err.message`);
        throw err;
      } else {
        font.networkSize = buffer.length;
        font.setContent(buffer.toString(font.encoding));
        callback(font);
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

module.exports = FontLoader;