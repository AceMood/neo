/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file swf
 * @author AceMood
 */

'use strict';

var Resource = require('./Resource');

class SWF extends Resource {
  /**
   * @param {object} obj
   * @returns {SWF}
   */
  static fromObject(obj) {
    var swf = new SWF(obj.path);
    swf.id = obj.id;
    swf.path = obj.path;
    swf.mtime = obj.mtime;
    return swf;
  }
  /**
   * @param {string} path 资源路径
   */
  constructor(path) {
    super(path);
    this.id = null;
  }
  /**
   * 资源转化成对象
   * @returns {object}
   */
  toObject() {
    return {
      path: this.path,
      id: this.id,
      type: this.type,
      mtime: this.mtime
    };
  }
}

SWF.prototype.type = 'swf';
SWF.prototype.encoding = 'binary';

module.exports = SWF;