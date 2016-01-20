
var Listener = require('./listener');

var _cache = {};

var server = new Listener(8000);
server.on('cache', function(message, data){
  message.reply({'you':'got it'})
});
//server.on('cache', function(message, data) {
//  var msg = 'got it';
//  switch (data.command) {
//    case 'hello':
//      msg = 'ok';
//      break;
//    case 'query':
//      msg = _cache[data.key] || 'null';
//      break;
//    case 'set':
//      _cache[data.key] = data.value;
//      break;
//    case 'delete':
//      delete _cache[data.key];
//      break;
//  }
//  message.reply({'you': msg})
//});