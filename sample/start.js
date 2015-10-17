
var Neo = require('../lib/Neo');
var loaders = Neo.loaders;

// 第一个数组表示需要针对何种类型的资源
// 第二个数组表示需要遍历的目录，应该是相对于vrd的路径
var neo = new Neo(
  [
    new loaders.JSLoader(),
    new loaders.CSSLoader()
  ],
  [
    "static",
    "components"
  ]
);

neo.update('map.json', function(map) {
  // 根据返回的map对象进行业务框架定制
  //
});