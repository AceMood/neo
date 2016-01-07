/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Saber-Team
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

'use strict';

const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

function escape(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe,  '\\$&');
}

const E = String.fromCharCode(27);
const colors = {
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

const styles = {
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

const back = {
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

exports.color = color;
exports.italic = italic;
exports.bold = bold;
exports.underline = underline;
exports.awesome = awesome;
exports.inverse = inverse;
exports.bg = bg;