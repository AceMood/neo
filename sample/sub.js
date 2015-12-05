//process.on('message', function(m) {
//    console.log('CHILD got message:', m);
//});
//
//process.send({ foo: 'bar' });

var NodeCache = require('node-cache');
var cache = new NodeCache();

cache.set('zmike', {name: 24});

console.log(process.args);