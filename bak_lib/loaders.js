/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file 对外的加载器门面
 * @author AceMood
 */

'use strict';

Object.defineProperty(exports, 'CSSLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/CSSLoader')
});

Object.defineProperty(exports, 'ImageLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/ImageLoader')
});

Object.defineProperty(exports, 'FontLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/FontLoader')
});

Object.defineProperty(exports, 'JSLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/JSLoader')
});

Object.defineProperty(exports, 'SWFLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/SWFLoader')
});

Object.defineProperty(exports, 'ProjectConfigurationLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/ProjectConfigurationLoader')
});

Object.defineProperty(exports, 'ResourceLoader', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: require('./loader/ResourceLoader')
});