# v0.6.0~
1. 去掉tpl资源类型和加载器, 更改为资源注册方式, 这样三方代码可以更灵活注册扫描的资源类型
2.

# v0.4.2
1. Image和Swf类型资源getContent默认返回binary编码的string, setContent设置也随之修改成接受string参数
2. resource对象提供flush方法写入指定位置

# v0.4.0
1. 添加扫描规则，若文件名称以`_`开头则默认不做扫描记入资源表，且这个方法可以在初始化`Neo`时提供和覆盖
2. 测试目录由`__test__`改成`test`，同node package.json的建议保持一致
3. 去掉tmplloader加载器
4. Image和Swf类型资源getContent默认返回原始buffer, setContent设置也随之修改成接受buffer参数


##. 添加html资源类型和相关加载器