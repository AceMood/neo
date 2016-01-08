# Engineering-Util-Logger
## 简介
在控制台打印彩色信息。是 [color模块](https://github.com/Marak/colors.js) 的一个简版，
提炼几个常用行为用于统一输出。另外，定制了工程化工具的logo。关于控制台颜色输出，更多
[看这里](http://blog.soulserv.net/terminal-friendly-application-with-node-js/)。
## 安装
```
npm install -g et-util-logger
```
## 使用
日志的输出分为6个等级，通过Level来表示。见下表

| 枚举参数| 值 | 描述 | 对应方法 |
| :--------- |:----------|--------------|:------------|
| Level.ALL | 0         | 打印所有日志 | any          |
| Level.FINE | 300      | 轨迹信息最详细 | logger.fine  |
| Level.INFO | 600      | 流程中的提示信息，应引起注意 | logger.info  |
| Level.WARNING | 900   | 警告，但程序仍可以继续 | logger.warn  |
| Level.ERROR | 1200    | 严重级别错误 | logger.error |
| Level.OFF | Infinity  | 不开启log | none         |


调用代码如下

```
var log = require("et-util-logger");

// 初始化Logger实例的时候传入默认的日志级别，不传默认是all
var logger = new log.Logger(log.Level.ALL);

// 代码中调用，输出警告信息，因为此时的level是all，意味着打印所有信息
logger.warn("Invalid property named " + prop);
// 此时控制台输出：[Warning] Invalid property named unknown

// 可以动态修改logger的输出级别，此处修改为error
logger.setLevel(log.Level.ERROR);

// 代码中调用，输出警告信息，但此时的level是error，意味着只会输出严重错误信息
// 所以调用warn方法不会打印任何信息
logger.warn("Invalid property named " + prop);
// 此时控制台输出：


```