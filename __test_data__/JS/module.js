/**
 * @provides module-tag
 * @module
 * @css foo-css
 *
 * Some text here
 */

var x = require('foo');
var bar = require('bar');

function foo(a) {
  return x(bar(a));
}

module.exports = foo;
