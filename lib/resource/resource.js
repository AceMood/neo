/**
 * @fileoverview 单个静态资源基类
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var CSS = require('./CSS');
var JS = require('./JS');
var ImgResource = require('./Image');
var SwfResource = require('./SwfResource');
var TplResource = require('./TplResource');


/**
 * 单例对象
 * @type {Object}
 */
var Resource = Object.create(null);


/**
 * 根据processor的配置对象创建相应类型的资源
 * @param {Object} config 处理器计算出的配置对象
 * @returns {Object}
 */
Resource.create = function(config) {
  switch (config.type) {
    case 'css':
        return new CSS(config);
        break;
    case 'js':
      return new JS(config);
      break;
    case 'swf':
      return new SwfResource(config);
      break;
    case 'img':
      return new ImgResource(config);
      break;
    case 'tpl':
      return new TplResource(config);
      break;
  }
  return null;
};


// export
module.exports = Resource;