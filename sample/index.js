/**
 * @sample Code Demo
 */

const neo = require('neo');

neo.config.set('exclude', [
  'node_modules',
  'test',
  'dist'
]);

neo.match(/\.html?/)
  .parse('babel', {

  })
  .plugin('uglify', {

  })
  .plugin('hash', {
    algorithm: 'hex',
    length: 7
  });

neo.match('*.js')
  .parse('babel', {

  }),
  .preprocess()
  .plugin('uglify', {

  })
  .postProcess();

neo.match('*.less')
  .parse('less');

neo.match('*.vue')
  .parse('vue-parser');



neo.run().pipe('dist');

/*
var fs = require('fs');

var Neo = require('./neo');
var Loaders = Neo.Loaders;


// 第一个数组表示需要针对何种类型的资源
// 第二个数组表示需要遍历的目录，应该是相对于vrd的路径
// 第三个是配置对象
var neo = new Neo([
  new Loaders.JSLoader(),
  new Loaders.CSSLoader(),
  new Loaders.ImageLoader(),
  new Loaders.ProjectConfigurationLoader()
], [
  'base', 'project'
]);

neo.on('postProcessed', function(map) {

  // debugger;
  // 基础服务组件生效，根据配置进行代码优化打包

});

neo.update('.cache', function(map) {

  debugger;

  // 根据返回的map对象进行业务框架定制
  fs.writeFileSync('map.json', JSON.stringify(map, null, 4), 'utf8');
});*/