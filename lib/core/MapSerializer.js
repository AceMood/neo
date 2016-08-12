/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file 序列化资源表的类
 * @author AceMood
 */

'use strict';

const fs          = require('fs');
const ResourceMap = require('./ResourceMap');

class MapSerializer {
  /**
   * 序列化资源表的类. 读写资源表. 用JSON函数来做序列/反序列化
   * @param {Array.<ResourceLoader>} loaders
   * @param {?Object} options
   */
  constructor(loaders, options) {
    let me = this;
    options = options || {};
    this.version = options.version || '0.1';
    this.typeMap = {};
    loaders.forEach(loader => {
      loader.getResourceTypes().forEach(type => {
        me.typeMap[type.prototype.type] = type;
      });
    });
  }

  /**
   * 异步加载文件反序列化之 todo 从ipc缓存中读取
   * @param {string}   path 文件绝对路径
   * @param {function} callback 回调函数
   */
  load(path, callback) {
    let me = this;
    fs.readFile(path, 'utf-8', (err, code) => {
      if (err || !code) {
        callback(err, null);
        return;
      }

      let ser = JSON.parse(code);
      let map = me.fromObject(ser);
      callback(null, map);
    });
  }

  /**
   * 加载文件反序列化之
   * @param   {string} path 文件绝对路径
   * @returns {ResourceMap}
   */
  loadSync(path) {
    let code;
    try {
      code = fs.readFileSync(path, 'utf-8');
    } catch (e) {
      return null;
    }
    if (!code) {
      return null;
    }

    let ser = JSON.parse(code);
    return this.fromObject(ser);
  }

  /**
   * 从对象生成资源表
   * @param   {!object} ser
   * @returns {?ResourceMap}
   */
  fromObject(ser) {
    if (ser.version === this.version) {
      let map = new ResourceMap();
      ser.objects.forEach(obj => {
        let Type = this.typeMap[obj.type];
        map.addResource(Type.fromObject(obj));
      });
      return map;
    } else {
      return null;
    }
  }

  /**
   * 序列化资源表存储到文件
   * @param {string}      path
   * @param {ResourceMap} map
   * @param {function}    callback
   */
  store(path, map, callback) {
    let ser = this.toObject(map);
    // todo 写到ipc缓存中
    fs.writeFile(path, JSON.stringify(ser, null, 2), 'utf-8', callback);
  }

  /**
   * 序列化资源表
   * @param   {ResourceMap} map
   * @returns {{version: *, objects: Array}}
   */
  toObject(map) {
    return {
      version: this.version,
      objects: map.getAllResources()
        // 去掉资源配置文件和页面文件
        .filter(resource => {
          return !resource.isConfiguration
            && !resource.isPage;
        })
        .map(resource => {
          return resource.toObject();
        })
    };
  }
}

module.exports = MapSerializer;