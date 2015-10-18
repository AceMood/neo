
var Neo = require('../lib/Neo');
var Loaders = Neo.Loaders;

// 第一个数组表示需要针对何种类型的资源
// 第二个数组表示需要遍历的目录，应该是相对于vrd的路径
// 第三个是配置对象
var neo = new Neo(
  [
    new Loaders.JSLoader(),
    new Loaders.CSSLoader(),
    new Loaders.ImageLoader()
  ],
  [
    "static",
    "components"
  ],
  {
    ns: 'sample',
    ver: '0.1'
  }
);

neo.update('map.json', function(map) {
  // 根据返回的map对象进行业务框架定制
  //
});