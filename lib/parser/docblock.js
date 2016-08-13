/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * @file parse doc-block
 * @author AceMood
 */

'use strict';

const docblockRe = /\s*(\/\*\*(.|\r?\n)*?\*\/)/;
const ltrimRe    = /^\s*/;

/**
 * retrieve text, remove leading '*'
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
const commentEndRe   = /\*\/$/;
const wsRe           = /[\t ]+/g;
const stringStartRe  = /(\r?\n|^) *\*/g;
const multilineRe    = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe     = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

/**
 * key-value in doc blocks
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