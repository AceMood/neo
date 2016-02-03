str = '\u00bd + \u00bc = \u00be';
var buf = new Buffer(str);

console.log(`${str}: ${str.length} characters, ` +
  `${Buffer.byteLength(str, 'utf8')} bytes, and buf.length is ${buf.length}`);

str = 'hello';
console.log(`${str}: ${str.length} characters, ` +
  `${Buffer.byteLength(str, 'utf8')} bytes, and buf.length is ${buf.length}`);