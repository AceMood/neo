# v0.6.8~
1. 去掉resource可以自编译的逻辑 放在soi里面做
2. 在soi中修复改变id后资源内部仍然记录老id引发的bug

# v0.7.0
1. 改变名字的资源, 其依赖项检测循环依赖的时候默认跳过
2. 去掉js文件中的requires指令, 功能与require方法调用重复, 任何js文件都可被包装成CommonJS模块使用

# v0.6.0~
1. 去掉MessageList代码和测试用例
2. Loaders内置类型不允许覆盖，只能覆盖后来注册的
3. 添加资源表循环依赖检测
4. resource可以自编译

# v0.5.0~
1. 去掉tpl资源类型和加载器, 更改为资源注册方式, 这样三方代码可以更灵活注册扫描的资源类型
2. 对于Image资源添加 `getDateUri` 方法获取行内数据
3. 去掉message消息传递机制，改用et-util-logger模块
4. 复写测试用例，采用mocha + chai.js等新测试框架
5. 修复loader在处理postProcessed的时候解析资源bug

# v0.4.2~
1. Image和Swf类型资源 `getContent` 默认返回binary编码的string, setContent设置也随之修改成接受string参数
2. resource对象提供flush方法写入指定位置

# v0.4.0~
1. 添加扫描规则，若文件名称以 `_` 开头则默认不做扫描记入资源表，且这个方法可以在初始化Neo时提供和覆盖
2. 测试目录由 `__test__` 改成 `test`，同node package.json的建议保持一致
3. 去掉tmplloader加载器
4. Image和Swf类型资源getContent默认返回原始buffer, setContent设置也随之修改成接受buffer参数


##. 添加html资源类型和相关加载器