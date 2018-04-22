/* @flow */

const toString = Object.prototype.toString;
const TYPE_MAP = {
  '[object Object]'   : 'object',
  '[object Array]'    : 'array',
  '[object Number]'   : 'number',
  '[object String]'   : 'string',
  '[object Boolean]'  : 'bool',
  '[object Function]' : 'function',
  '[object Null]'     : 'null',
  '[object Undefined]': 'undefined'
};

export function isObject(val: any): boolean {
  return toString.call(val) === '[object Object]';
};

export function isArray(val: any): boolean {
  return Array.isArray(val);
};

export function typeOf(val: any): string {
  let type = TYPE_MAP[toString.call(val)];
  return type ? type : '';
};