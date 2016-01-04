/**
 * @file 向控制台写入消息
 */

'use strict';

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
function escape(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe,  '\\$&');
}

var E = String.fromCharCode(27);

var colors = {
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39]
};

function color(name, text) {
  return E + '[' + colors[name][0] + 'm' + escape(text) +
      E + '[' + colors[name][1] + 'm';
}

exports.color = color;

var styles = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],
  awesome: ['1;4;7;5;42;35']
};

function wrap(name, text) {
  return E + '[' + styles[name][0] + 'm' + escape(text) +
      E + '[m';
}

function bold(text) {
  return wrap('bold', text);
}

function underline(text) {
  return wrap('underline', text);
}

function inverse(text) {
  return wrap('inverse', text);
}

function awesome(text) {
  return wrap('awesome', text);
}

function italic(text) {
  return wrap('italic', text);
}

exports.italic = italic;
exports.bold = bold;
exports.underline = underline;
exports.awesome = awesome;
exports.inverse = inverse;

var back = {
  black: [40, 49],
  red: [41, 49],
  green: [42, 49],
  yellow: [43, 49],
  blue: [44, 49],
  magenta: [45, 49],
  cyan: [46, 49],
  white: [47, 49]
};

function bg(name, text) {
  return E + '[' + back[name][0] + 'm' + escape(text) +
      E + '[' + back[name][1] + 'm';
}

exports.bg = bg;


/**
 * 显示错误消息但不退出进程.
 * @param {string} var_msg
 */
exports.error = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('red', msg));
};

/**
 * 显示警告.
 * @param {string} var_msg
 */
exports.warn = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('yellow', msg));
};

/**
 * 显示完成消息.
 * @param {string} var_msg
 */
exports.ok = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('green', msg));
};

/**
 * 显示实用信息.
 * @param {string} var_msg
 */
exports.info = function(var_msg) {
  var msg = Array.prototype.join.call(arguments, '');
  msg = String(msg);
  console.log(color('cyan', msg));
};

/**
 * 打印soi
 */
exports.logo = function() {
  var fs = require('fs');
  var soi = fs.readFileSync(__dirname + '/soi.txt');
  var planet = fs.readFileSync(__dirname + '/planet.txt');
  console.log(color('yellow', soi));
  console.log(color('cyan', planet));
};