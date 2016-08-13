/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file font class
 * @author AceMood
 */

'use strict';

var Resource = require('./Resource');

class Font extends Resource {
  /**
   * @param {object} obj
   * @returns {Font}
   */
  static fromObject(obj) {
    var font = new Font(obj.path);
    font.id = obj.id;
    font.path = obj.path;
    font.mtime = obj.mtime;
    return font;
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

Font.prototype.type = 'font';
Font.prototype.encoding = 'binary';

module.exports = Font;