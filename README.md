neo-core
=========
__neo-core__ 是前端工程化工具 __soi__ 的资源扫描器。对于指定的工程目录由相应的 __ResourceLoader__ 加载并解析其对应的 __Resource__, 产出一份原始的资源表，资源表以对象变量的形式传递给 __soi__ 的调用函数。

## 本文内容
* [安装](#guide_install)
* [使用方法](#guide_usage)
* [资源扫描器](#guide_resourceloader)
   1. [JSLoader](#guide_resourceloader__js)
   2. [CSSLoader](#guide_resourceloader_css)
   3. [ImageLoader](#guide_resourceloader_image)
   4. [其他](#guide_resourceloader_other)
* [资源](#guide_resource)
   1. [JS](#guide_resource_js)
   2. [CSS](#guide_resource_css)
   3. [Image](#guide_resource_image)
   4. [其他](#guide_resource_other)


## [安装](id:guide_install)
确保安装了node，并且版本大于1.0.0。原因是自v4.0.0 nodejs同iojs开发版合并，v8版本升级到4.5.x，从此支持部分es6的语法，neo-core采用es6语法编写。

```
npm install neo-core -g
```

## [第三方调用](id:guide_usage)

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
## [资源扫描器](id:guide_resourceloader)
neo-core目前内置了四种资源扫描器，这四种加载器目前不允许覆盖。

* JSLoader
* CSSLoader
* ImageLoader
* SWFLoader

### [JSLoader](id:guide_resourceloader_js)
负责扫描javascript文件，解析模块依赖关系。
如：

```
/**
 * @provides dialog
 * @module
 * @require jQuery
 * @css ./dilog.less
 */
 
 var title = require('./conf/title');
 var string = require('string');
 var $title = string.trimLeft(title);
 
 require.async(['ajax'], function(ajax) {
 
 });
 
 exports.title = $title;

```
最终会生成一个资源对象resource，且

```
resource.id = 'dialog';
resource.type = 'JS';
resource.isModule = true;
resource.requiredModules = ['jQuery', './conf/title', 'string'];
resource.requiredCSS = ['./dialog.less'];
resource.requiredAsyncModules = ['ajax'];

```
加载器通过头注释声明一些模块自描述信息，和源码中对require，require.async的调用解析该资源的必要属性，存储到资源表中。关于更多头注释docblock的说明，可以参考 [资源字段](#guide_resource_js)

### [CSSLoader](id:guide_resourceloader_css)
负责扫描css以及less文件，解析模块依赖关系。
如：

```
/**
 * @provides dialog
 * @css reset-style
 */
 
 .bo-dialog {}

```
最终会生成一个资源对象resource，且

```
resource.id = 'dialog';
resource.type = 'CSS';
resource.requiredCSS = ['reset-style'];

```
加载器通过头注释声明一些模块自描述信息，和源码中对require，require.async的调用解析该资源的必要属性，存储到资源表中。关于更多头注释docblock的说明，可以参考 [资源字段](#guide_resource_css)

## [资源](id:guide_resource)

### [JS](id:guide_resource_js)
### [CSS](id:guide_resource_css)
### [Image](id:guide_resource_image)












