/**
 * @file SWF资源
 * @author AceMood
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var Resource = require('./Resource');
var util = require('../util');

/**
 * @extends {Resource}
 * @constuctor
 * @param {string} path 资源路径
 */
function SWF(path) {
  Resource.call(this, path);
  this.id = null;
}

inherits(SWF, Resource);

SWF.prototype.type = 'SWF';
SWF.prototype.encoding = 'binary';

/**
 * @static
 * @param {Object} obj
 * @returns {SWF}
 */
SWF.fromObject = function(obj) {
  var swf = new SWF(obj.path);
  swf.path = obj.path;
  swf.mtime = obj.mtime;
  return swf;
};

/**
 * 资源转化成对象
 * @returns {Object}
 */
SWF.prototype.toObject = function() {
  return {
    path: this.path,
    id: this.id,
    type: this.type,
    mtime: this.mtime
  };
};

// 导出
module.exports = SWF;