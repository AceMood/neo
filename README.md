neo-core
=========
__neo-core__ 是前端工程化工具 __soi__ 的资源扫描器。对于指定的工程目录由相应的 __ResourceLoader__ 加载并解析其对应的 __Resource__, 产出一份原始的资源表，资源表以对象变量的形式传递给 __soi__ 的调用函数。

## Contents
* [Install](#install)
* [Usage](#usage)
* [ResourceLoader](#resourceloader)
   * [CSSLoader](#cssloader)
   * [JSLoader](#jsloader)
   * [Others](#other-loader)
* [Resource](#resource)
   * [CSS](#css)
   * [JS](#js)
   * [Others](#other-resource)

----
## Install
确保安装了node，并且版本大于1.0.0。原因是自v4.0.0 nodejs同iojs开发版合并，v8版本升级到4.5.x，从此支持部分es6的语法，neo-core采用es6语法编写。

```
npm install neo-core -g
```

## Usage

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
## ResourceLoader
neo-core目前内置了四种资源加载器，这四种加载器目前不允许覆盖。

* JSLoader
* CSSLoader
* ImageLoader
* SWFLoader


### CSSLoader
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

### JSLoader
负责扫描javascript文件，解析模块依赖关系。
若源码如下：

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
则最终会生成一个资源对象resource，且

```
resource.id = 'dialog';
resource.type = 'JS';
resource.isModule = true;
resource.requiredModules = ['jQuery', './conf/title', 'string'];
resource.requiredCSS = ['./dialog.less'];
resource.requiredAsyncModules = ['ajax'];

```
加载器通过头注释声明一些模块自描述信息，和源码中对require，require.async的调用解析该资源的必要属性，存储到资源表中。关于更多头注释docblock的说明，可以参考 [资源字段](#js)


### Other Loader
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

## Resource
每一种静态资源对应一个resource类，其各个字段标志了当前资源的属性，供后续工程化处理流程使用。
#### docblock directive
称作注释头，用以下代码表示且出现在源码中的最上部

```
/**
 * @directive [value]
 */
```
### CSS



### JS

可包含的头注释指令：
#### **@module**       
标示该js文件需要在后处理时被模块化包裹，soi使用 [kerneljs][kerneljs] 作为浏览器端模块加载器，并且会将标志为模块的代码进行CommonJS封装。例：

```
/**
 * @module
 */
```
#### **@provides**     
为当前文件提供资源Id。同一类型的资源不允许出现同样的Id，但不同类型的资源可以。比如有两个js文件同时用provides指令声明了id为dialog，则会使资源表产出错误，写如果不做处理会使得线上程序出现问题。但如果一个css文件声明为id: dialog且另一个js文件也做了同样声明则不会产生冲突。例：

```
/**
 * @provides dialog
 */
```

#### **@require** 
声明当前文件依赖的其他js文件。这种方式与源码中通过require进来的模块相比，不同点在于，依赖的文件可以不符合CommonJS规范，比如jQuery或者其他任何第三方类库。放在头注释指令中仅仅是告诉工具：要运行文件中的js，必须提前加载指令中出现的资源。指令的值可以是相对路径，也可以是依赖文件通过provides指令声明的资源Id。例：

```
/**
 * @require jQuery, backbone, underscore, ./base.js
 */
``` 
     
#### **@css**
声明当前文件需要的css资源。此指令告诉工具：要运行文件中的js，这些css必须要先准备好。指令的值可以是相对路径，也可以是依赖文件通过provides指令声明的资源Id。例：

```
/**
 * @css reset-style, ./base.css ./dialog.less
 */
``` 

#### **@permanent**



#### **@nonblocking**


### Others


[kerneljs]: https://github.com/AceMood/kerneljs/  "kerneljs"











