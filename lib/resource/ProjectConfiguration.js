/**
 * @fileoverview package.json文件的表示
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var fs = require('fs');
var path = require('path');

var Resource = require('./Resource');

/**
 * package.json表示的资源
 * @extends {Resource}
 * @constructor
 * @param {String} path 资源的路径
 * @param {Object} data 资源源代码表示的对象
 */
function ProjectConfiguration(path, data) {
  this.path = node_path.normalize(path);
  this.id = path;
  this.data = data;
}

inherits(ProjectConfiguration, Resource);
ProjectConfiguration.__proto__ = Resource;

ProjectConfiguration.prototype.type = 'ProjectConfiguration';

/**
 * 返回neo前缀，没有的话返回上级目录名.
 * 这个值返回后通常作为命名空间前缀.
 * {
 *   neo: {
 *     prefix: 'common',
 *     roots: ['html', 'static']
 *   }
 * }
 * @return {String}
 */
ProjectConfiguration.prototype.getNeoPrefix = function() {
  return this.data.neo && this.data.neo.prefix !== (void 0) ?
    this.data.neo.prefix :
    path.basename(path.dirname(this.path));
};

/**
 * 返回当前package.json作用的目录路径. 默认是当前目录.
 * @return {Array.<String>}
 */
ProjectConfiguration.prototype.getRoots = function() {
  var dirname = path.dirname(this.path);
  if (this.data.neo && this.data.neo.roots) {
    return this.data.neo.roots.map(function(root) {
      return path.join(dirname, root);
    });
  }
  return [dirname];
};

/**
 * "Project Path"即项目路径指的是项目所在的绝对目录.
 * 项目所在根目录`myProject`中包含`package.json`.
 * 如果package.json的具体位置是`/some/dir/myProject/package.json`, 则
 * inferred project dir是包含项目根目录的目录, 即`/some/dir/`.
 */
ProjectConfiguration.prototype.getInferredProjectPath = function() {
  return path.resolve(this.path, '..', '..');
};

/**
 * 简单的规则标识CommonJS模块唯一性.
 * 不应该现在解析IDs - 因为需要知道资源表的全貌, 应该在后处理时期`postProcess`.
 * 目前的任务就是唯一标记js模块. 这里约定取项目中的`package.json`的name字段,
 * 并附加上物理文件路径.
 *
 * Attempting to choose an ID that has _meaning_ (by trying to pre-resolve
 * `projectName/index.js` to `projectName` etc) is impossible at this time. An
 * ambiguity occurs when we later discover that the `package.json` pointed the
 * "main" module to another file. We couldn't possibly know which should claim
 * the `projectName` ID until we've processed all resources. This is why
 * dependency resolution can't *properly* happen until `postProcess`.
 *
 * 约定：用于标志CommonJS模块的ID是由`package.json`的`project name`外加上文件相对于
 * `package.json`的路径.
 *   > projectName/index.js
 *   > projectName/path/to/file.js
 *
 * 这种约定的副作用就是在后处理过程中对文件依赖模块的静态分析, in `postProcess`:
 *   > require('x/y/z.js')
 *
 * 如果调用require的地方直接引用的文件对应IDs则不会出现问题, 其他代码约定会出现问题.
 * 如果简单的寻找js资源'x/y/z.js'很可能出错. 不需要you don't need to fall back to
 * more expensive path resolutions - which must analyze `package.json` files
 * etc.
 *
 * 加载器会给注释中提供IDs`@providesModule`的JS文件分配该id.
 *
 * 任何资源的path标志了资源的物理路径, 但是ID并没有这个作用, 除非资源类型确定.
 * 也许会有两个资源有同样的ID但是资源类型不同. 比如 {id: 'hello/hello.js'}
 * 并不能表示唯一的物理文件, 但是 {type: 'JS', id: 'hello/hello.js'} 可以.
 * 也就是说, 两个文件可以有同样的模块ID, 但资源类型一定不同.
 * 如下
 * A:
 *   id: myProject/x.js
 *   path: /home/myProject/x.js
 *   type: 'JS'
 *
 * A-mock:
 *   id: myProject/x.js
 *   path: /home/myProject/x-mock.js
 *   type: 'JSMock'
 *
 * However, no two distinct files have the same resource ID and the same
 * resource type and obviously no two distinct files have the same absolute
 * "path".
 *
 * @param  {String} filePath
 * @return {?String}
 */
ProjectConfiguration.prototype.resolveID = function(filePath) {
  var directories = this.getRoots();
  var prefix = this.getNeoPrefix();

  for (var i = 0; i < directories.length; i++) {
    var directory = directories[i];
    // 找到文件在哪个目录
    if (filePath.indexOf(directory + path.sep) === 0) {
      var result = path.relative(directory, filePath);
      if (prefix) {
        result = path.join(prefix, result);
      }
      return result;
    }
  }

  return null;
};

// 导出
module.exports = ProjectConfiguration;