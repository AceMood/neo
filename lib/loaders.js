/**
 * @file 对外的加载器门面
 */

'use strict';

exports.CSSLoader = require('./loader/CSSLoader');
exports.ImageLoader = require('./loader/ImageLoader');
exports.JSLoader = require('./loader/JSLoader');
exports.TMPLLoader = require('./loader/TMPLLoader');
exports.ProjectConfigurationLoader =
  require('./loader/ProjectConfigurationLoader');
exports.ResourceLoader = require('./loader/ResourceLoader');
