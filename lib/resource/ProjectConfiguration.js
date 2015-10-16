/**
 * @fileoverview package.json文件表示的类
 * @email zmike86@gmail.com
 */

'use strict';

var inherits = require('util').inherits;
var node_path = require('path');
var fs = require('fs');

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
 * 返回neo前缀，没有的话返回上级目录名
 * {
 *   neo: {
 *     prefix: 'common',
 *     roots: ['html', 'static']
 *   }
 * }
 * @return {String}
 */
ProjectConfiguration.prototype.getNeoPrefix = function () {
  return this.data.neo && this.data.neo.prefix !== (void 0) ?
    this.data.neo.prefix :
    path.basename(path.dirname(this.path));
};

/**
 * 返回当前package.json作用的目录路径。默认是当前目录。
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
 * The "Project Path" is the absolute path of the directory where "projects"
 * live. Projects consist of a root folder `myProject` which contains a
 * `package.json` file at `myProject/package.json`.
 *
 * If a `package.json` lives at /some/dir/myProject/package.json then, the
 * inferred project dir would be /some/dir/
 *
 * Note that the project path is the directory *above* the module root.
 */
ProjectConfiguration.prototype.getInferredProjectPath = function() {
  return path.resolve(this.path, '..', '..');
};

/**
 * 简单的规则标识commonjs模块唯一性。
 *
 * We don't try to "pre-resolve" any IDs here - To do this properly, we'd need a
 * more complete picture of the resource map, that is only available at
 * `postProcess` time.
 * 目前的任务就是唯一标记js模块。这里约定取项目中的`package.json`的"name"字段，
 * 并附加上物理文件路径。
 *
 * Attempting to choose an ID that has _meaning_ (by trying to pre-resolve
 * `projectName/index.js` to `projectName` etc) is impossible at this time. An
 * ambiguity occurs when we later discover that the `package.json` pointed the
 * "main" module to another file. We couldn't possibly know which should claim
 * the `projectName` ID until we've processed all resources. This is why
 * dependency resolution can't *properly* happen until `postProcess`.
 *
 * 约定：用于标志commonjs模块的ID是由`package.json`的project name外加上文件相对于
 * `package.json`的路径。
 *
 *   > projectName/index.js
 *   > projectName/path/to.js
 *
 * A nice side effect of the particular convention chosen here, is when
 * statically analyzing dependencies in `postProcess`:
 *
 *   > require('x/y/z.js')
 *
 * requiring files by IDs always resolves to the module with that ID. Other
 * conventions don't have this property. So if you can simply lookup 'JS'
 * resource `'x/y/z.js'` and quickly get a hit, you don't need to fall back to
 * more expensive path resolutions - which must analyze `package.json` files
 * etc.
 *
 * Another loader will assign IDs to `@providesModule` JS files.
 *
 * Any resource "path" identifies the physical resource, but the resource ID
 * doesn't yet identify a physical resource, until the "type" of resource is
 * specified. You might have two resources, with the same ID and different
 * types. For example {id: 'hello/hello.js'} does not identify a physical file,
 * but {type: 'JS', id: 'hello/hello.js'} might.
 *
 * Two physical files might have the same module ID, but different types, as is
 * the case with mock files.
 *
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
 *
 * @param  {String} filePath
 * @return {?String}
 */
ProjectConfiguration.prototype.resolveID = function(filePath) {
  var hasteDirectories = this.getRoots();
  var prefix = this.getNeoPrefix();

  for (var i = 0; i < hasteDirectories.length; i++) {
    var hasteDirectory = hasteDirectories[i];
    if (filePath.indexOf(hasteDirectory + path.sep) === 0) {
      var result = path.relative(hasteDirectory, filePath);
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