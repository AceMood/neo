/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file *.swf文件加载器
 * @author AceMood
 */

/* globals logger */

'use strict';

var fs = require('fs');
var ResourceLoader = require('./ResourceLoader');
var SWF = require('../resource/SWF');

class SWFLoader extends ResourceLoader {
  /**
   * @param {object} object
   * @returns {SWFLoader}
   */
  static fromObject(object) {
    return new SWFLoader(object.options);
  }

  constructor(options) {
    super(options);
  }

  matchPath(filePath) {
    return filePath.lastIndexOf('.swf') === filePath.length - 4;
  }

  getResourceTypes() {
    return [SWF];
  }

  getExtensions() {
    return ['.swf'];
  }

  /**
   * 给定路径创建新资源
   * @param {string}               path      resource being built
   * @param {ProjectConfiguration} configuration configuration for the path
   * @param {function}             callback
   */
  loadFromPath(path, configuration, callback) {
    var swf = new SWF(path);
    swf.id = path;

    fs.readFile(path, (err, buffer) => {
      if (err) {
        logger.error(
          'Reading file at:  ' + path,
          err.message
        );
        throw err;
      } else {
        swf.networkSize = buffer.length;
        swf.setContent(buffer.toString(swf.encoding));
        callback(swf);
      }
    });
  }
}

module.exports = SWFLoader;