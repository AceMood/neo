/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
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
 * @file 解析头部注释中的信息
 * @author AceMood
 */

'use strict';

const docblockRe = /^\s*(\/\*\*(.|\r?\n)*?\*\/)/;
const ltrimRe = /^\s*/;

/**
 * 提取文本信息, 除去每行首的'*'
 * @param  {string} contents
 * @return {string}
 */
function extract(contents) {
  var match = contents.match(docblockRe);
  if (match) {
    return match[0].replace(ltrimRe, '') || '';
  }
  return '';
}

const commentStartRe = /^\/\*\*?/;
const commentEndRe = /\*\/$/;
const wsRe = /[\t ]+/g;
const stringStartRe = /(\r?\n|^) *\*/g;
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

/**
 * 得到注释中的健值对
 * @param  {string} docblock
 * @return {Array}
 */
function parse(docblock) {
  docblock = docblock
    .replace(commentStartRe, '')
    .replace(commentEndRe, '')
    .replace(wsRe, ' ')
    .replace(stringStartRe, '$1');

  // Normalize multi-line directives
  var prev = '';
  while (prev !== docblock) {
    prev = docblock;
    docblock = docblock.replace(multilineRe, '\n$1 $2\n');
  }
  docblock = docblock.trim();

  var result = [];
  var match = propertyRe.exec(docblock);
  while (match) {
    result.push([match[1], match[2]]);
    match = propertyRe.exec(docblock);
  }

  return result;
}

exports.extract = extract;
exports.parse = parse;