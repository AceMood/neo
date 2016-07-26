
neo-core
=========

__Build Info__

[![project][project-image]][project-url]
[![Build status][travis-image]][travis-url]
[![Codacy Badge][codacy-image]][codacy-url]
[![Codacy Badge][coverage-image]][codacy-url]

__Downloads Info__

[![Downloads][downloads-image]][downloads-url]
[![Downloads][downloads-all-image]][downloads-url]

__Miscellaneous__

[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![maintain][maintain-image]][project-url]


__neo-core__ 是前端工程化工具 __soi__ 的资源扫描器。对于指定的工程目录由相应的 __ResourceLoader__ 加载并解析其对应的 __Resource__, 产出一份原始的资源表，资源表以对象变量的形式传递给 __soi__ 的调用函数。

注意: neo不能单独使用, 需要结合其他模块一起使用（例如__soi__）。neo提供的只有api, 并不支持命令行执行。

# 目录
* [安装](#安装)
* [使用](#使用)
   * [neo的参数](#neo的参数)
   * [neo的方法](#neo的方法)
   * [neo的属性](#neo的属性)
* [资源加载器](#资源加载器)
   * [CSSLoader](#cssloader)
   * [JSLoader](#jsloader)
   * [Others](#other-loader)
* [资源](#资源)
   * [CSS](#css)
   * [JS](#js)
   * [Others](#other-resource)

----
# 安装
确保安装了node，并且版本大于1.0.0。原因是自v4.0.0 nodejs同iojs开发版合并，v8版本升级到4.5.x，从此支持部分es6的语法，neo-core采用es6语法编写。

```
npm install neo-core -g
```

# 使用

```
var Neo = require('neo-core');
var Loaders = Neo.Loaders;

var neo = new Neo([
  new Loaders.JSLoader(),
  new Loaders.CSSLoader(),
  new Loaders.ImageLoader()
], [
  'src' // 这里指定要扫描的目录，默认是当前工作目录，即'.'
]);

neo.update('.cache', function(map) {

  // 这里得到返回的资源表对象进行定制
  
});

```
## neo的参数
初始化参数：

* Loaders `{Array.<ResourceLoader>}`

  资源加载器数组，标志扫描器需要扫描的资源。正如 [ResourceLoader](#resourceloader) 介绍的，每种类型的资源对应一种资源加载器。通过在初始化neo的时候传入Loaders数组，可以控制扫描器加载的资源类型，即资源表最后包含的资源类型。
  
* ScanDirs `{Array.<string>}`
  扫描目录数组。相对于当前工作目录（工程目录）做计算。这里可以控制不需要扫描的目录，将其排除在外。

* Options `{?object=}`
  可包含以下字段：
   * checkCircular `{boolean=}`     
     __说明：__ 是否检查循环依赖, 默认为true
   * forceRescan   `{boolean=}`     
     __说明：__ 是否不读取上次扫描缓存, 默认false
   * ignorePaths   `{function:boolean=}`  
     __说明：__ 返回是否忽略路径的函数
   * logger        `{Logger=}` 
     __说明：__ 用于日志输出的logger，可以由外部传进来，否则neo会初始化一个默认级别为All的全局slogger作为日志记录。logger的具体用法和信息可见：[logger][et-util-logger]
   * maxOpenFiles  `{number=}`  
     __说明：__ 加载器在扫描文件并对源码做解析的时候，有可能由于工程目录下静态资源文件很多造成时间较长，可以在这里限制一次处理的文件的最大数目，结合 maxProcesses可以利用pc的多核减轻单线程的解析工作压力
   * maxProcesses  `{number=}`  
     __说明：__ 加载器处理文件时可以打开的最大子进程数目
   * serializer    `{MapSerializer=}`  
     __说明：__ 自定义序列化/反序列化资源表的实现。序列化成对象存在缓存中，下次扫描在资源没有改动的情况下直接读取缓存结果，因为neo已经内置了一个默认的序列化实现，所以没有特别需要可以不做指定
   * useNativeFind `{boolean=}`  
     __说明：__ 使用linux系统的shell命令还是node实现的方法
   * version       `{string=}`  
     __说明：__ 缓存的版本. 如果版本和缓存不一致则忽略缓存

## neo的方法
* update (string, function, object=)


## neo的属性
* Loaders (static)
* Resource (static)

# 资源加载器
neo-core目前内置了四种资源加载器，这四种加载器目前不允许覆盖。

* JSLoader
* CSSLoader
* ImageLoader
* SWFLoader


## CSSLoader
负责扫描css以及less文件，解析模块依赖关系。
若源码如下：

```
/**
 * @provides dialog
 * @css reset-style
 */
 
 .bo-dialog {}

```
则最终会生成一个资源对象resource，且

```
resource.id = 'dialog';
resource.type = 'CSS';
resource.requiredCSS = ['reset-style'];

```
加载器通过头注释声明一些模块自描述信息，关于更多头注释docblock的说明，可以参考 [资源字段](#css)

## JSLoader
负责扫描javascript文件，解析模块依赖关系。
若源码如下：

```
/**
 * @provides dialog
 * @module
 * @requires jQuery
 * @css ./dilog.less
 */
 
 var title = require('./conf/title');
 var string = require('string');
 var $title = string.trimLeft(title);
 
 require.async(['ajax'], function(ajax) {
 
 });
 
 exports.title = $title;

```
则最终会生成一个资源对象resource，且

```
resource.id = 'dialog';
resource.type = 'js';
resource.isModule = true;
resource.requiredModules = ['jQuery', './conf/title', 'string'];
resource.requiredCSS = ['./dialog.less'];
resource.requiredAsyncModules = ['ajax'];

```
加载器通过头注释声明一些模块自描述信息，和源码中对require，require.async的调用解析该资源的必要属性，存储到资源表中。关于更多头注释docblock的说明，可以参考 [资源字段](#js)


## Other Loader
开发者可以定制自己项目中需要扫描的资源类型，比如tpl。
需要实现类似其他资源加载器的TPLLoader，并且实现相应的资源类型TPL。具体可以参考源码中的resource/目录和loader/目录下的实现完成。并最终通过初始化扫描器时传入该种资源，如：

```
var TPLLoader = require('plugin-tplloader');
var Neo = require('neo-core');
var Loaders = Neo.Loaders;

var neo = new Neo([
  new TPLLoader(),
  new Loaders.JSLoader(),
  new Loaders.CSSLoader(),
  new Loaders.ImageLoader()
], [
  'src' // 这里指定要扫描的目录，默认是当前工作目录，即'.'
]);

neo.update('.cache', function(map) {

  // 这里得到返回的资源表对象进行定制
  
});

```
也可以将加载器注册到Neo.Loaders中，再使用，如：

```
var TPLLoader = require('plugin-tplloader');
var Neo = require('neo-core');

Neo.registerResourceLoader('TPLLoader', TPLLoader);

var Loaders = Neo.Loaders;
var neo = new Neo([
  new Loaders.TPLLoader(),
  new Loaders.JSLoader(),
  new Loaders.CSSLoader(),
  new Loaders.ImageLoader()
], [
  'src' // 这里指定要扫描的目录，默认是当前工作目录，即'.'
]);

neo.update('.cache', function(map) {

  // 这里得到返回的资源表对象进行定制
  
});

```

# 资源
每一种静态资源对应一个resource类，其各个字段标志了当前资源的属性，供后续工程化处理流程使用。
#### docblock directive
称作头注释，用以下代码表示且出现在源码中的最上部

```
/**
 * @directive [value]
 */
```
## CSS

可包含的头注释指令：

### **@provides**     
为当前文件提供资源Id。同一类型的资源不允许出现同样的Id，但不同类型的资源可以。比如有两个js文件同时用provides指令声明了id为dialog，则会使资源表产出错误，写如果不做处理会使得线上程序出现问题。但如果一个css文件声明为id: dialog且另一个js文件也做了同样声明则不会产生冲突。例：

```
/**
 * @provides dialog
 */
```

### **@css**
声明当前文件需要的css资源。此指令告诉工具：要运行文件中的js，这些css必须要先准备好。指令的值可以是相对路径，也可以是依赖文件通过provides指令声明的资源Id。例：

```
/**
 * @css reset-style, ./base.css ./dialog.less
 */
``` 

### **@permanent**
声明文件内容长期极其稳定，不需要进行额外的流程化工作。比如reset.min.css，可能在编译时会浪费编译时间，但这个文件已经稳定，内容短期不会变化且已经被压缩，此时可以使用这个指令来告诉工具：不要动这个文件的内容，也没有必要动。例：

```
/**
 * @permanent
 */
```

## JS

可包含的头注释指令：
#### **@module**       
标示该js文件需要在后处理时被模块化包裹，soi使用 [kerneljs][kerneljs] 作为浏览器端模块加载器，并且内置的wrapper插件会将标志为模块的代码进行CommonJS包装。例：

```
/**
 * @module
 */
```
### **@provides**     
为当前文件提供资源Id。同一类型的资源不允许出现同样的Id，但不同类型的资源可以。比如有两个js文件同时用provides指令声明了id为dialog，则会使资源表产出错误，写如果不做处理会使得线上程序出现问题。但如果一个css文件声明为id: dialog且另一个js文件也做了同样声明则不会产生冲突。例：

```
/**
 * @provides dialog
 */
```
     
### **@css**
声明当前文件需要的css资源。此指令告诉工具：要运行文件中的js，这些css必须要先准备好。指令的值可以是相对路径，也可以是依赖文件通过provides指令声明的资源Id。例：

```
/**
 * @css reset-style, ./base.css ./dialog.less
 */
``` 

### **@permanent**
声明文件内容长期极其稳定，不需要进行额外的流程化工作。比如echart.min.js，可能在编译时会浪费不少编译时间，但这个文件已经稳定，内容短期不会变化且已经被压缩，此时可以使用这个指令来告诉工具：不要动这个文件的内容，也没有必要动。例：

```
/**
 * @permanent
 */
```
### **@entry**
声明加载这个文件时该模块作为整个页面或者页面独立的一部分的逻辑入口。有此标签的js模块会在打包时加上`kerneljs.exec`的包裹函数，该模块的回调函数会在依赖模块加载完毕后立即执行。此处不同于**module**指令，前者只会做CommonJS的`define`函数包裹，生命的模块不会立即执行，采用的是惰性执行的方式，只有require时才会导出模块对象。指令示例：

```
/**
 * @entry
 */
```


[kerneljs]: https://github.com/AceMood/kerneljs/  "kerneljs"
[et-util-logger]: https://github.com/Saber-Team/Engineering-Util-Logger "logger"

[project-image]: https://img.shields.io/badge/neo--core-good-brightgreen.svg
[project-url]: https://github.com/AceMood/neo

[travis-image]: https://travis-ci.org/AceMood/neo.svg?branch=master
[travis-url]: https://travis-ci.org/AceMood/neo-core

[npm-image]: https://img.shields.io/npm/v/neo-core.svg
[npm-url]: https://npmjs.org/package/neo-core

[node-image]: https://img.shields.io/node/v/neo-core.svg
[node-url]: https://npmjs.org/package/neo-core

[david-image]: https://david-dm.org/AceMood/neo.svg
[david-url]: https://david-dm.org/AceMood/neo-core

[downloads-image]: https://img.shields.io/npm/dm/neo-core.svg
[downloads-url]: https://npmjs.org/package/neo-core
[downloads-all-image]: https://img.shields.io/npm/dt/neo-core.svg

[license-image]: https://img.shields.io/npm/l/soi.svg
[license-url]: LICENSE

[maintain-image]: https://img.shields.io/badge/maintained-Yes-blue.svg

[coverage-image]: https://api.codacy.com/project/badge/coverage/43c442e150024a5fb80c876bb426c139
[codacy-image]: https://api.codacy.com/project/badge/grade/43c442e150024a5fb80c876bb426c139
[codacy-url]: https://www.codacy.com/app/zmike86/neo







