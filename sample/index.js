/**
 * @sample Code Demo
 */

'use strict';

var fs = require('fs');

var Neo = require('../lib/Neo');
var Loaders = Neo.Loaders;

//var JSLoader = require('../lib/loader/JSLoader');
//Neo.registerResourceLoader('JSLoader', JSLoader);

// 第一个数组表示需要针对何种类型的资源
// 第二个数组表示需要遍历的目录，应该是相对于vrd的路径
// 第三个是配置对象
var neo = new Neo([
  new Loaders.JSLoader(),
  new Loaders.CSSLoader(),
  new Loaders.ImageLoader(),
  new Loaders.SWFLoader()
], [
  /*'core',*/ 'base', 'project'
]);

neo.on('postProcessed', function(map) {

  // debugger;
  // 基础服务组件生效，根据配置进行代码优化打包

});

neo.update('.cache', function(map) {

  debugger;

  // 根据返回的map对象进行业务框架定制
  fs.writeFileSync('map.json', JSON.stringify(map, null, 4), 'utf8');
});