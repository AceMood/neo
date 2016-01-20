var messenger = require('./m/messenger');

var name = 'cache';
var client = messenger.createSpeaker(8000);
messenger.createListener();

setTimeout(function() {
  client.request(name, {hello: 'world'}, function (data) {
    console.log(data);
  });
}, 1000);

//client.request(name, {
//  command: 'hello'
//}, function(data) {
//  if (data && data.you === 'ok') {
//    exec();
//  } else {
//    messenger.createListener();
//  }
//
//  process.exit();
//});

//exec();
//
//function exec() {
//  var _cache = {};
//  server.on('cache', function(message, data) {
//    var msg = 'got it';
//    switch (data.command) {
//      case 'hello':
//        msg = 'ok';
//        break;
//      case 'query':
//        msg = _cache[data.key] || 'null';
//        break;
//      case 'set':
//        _cache[data.key] = data.value;
//        break;
//      case 'delete':
//        delete _cache[data.key];
//        break;
//    }
//    message.reply({'you': msg})
//  });
//
//  client.request(name, {
//    command: 'set',
//    key: 'moda',
//    value: 'Hello World!'
//  }, function(data) {
//
//    console.log(data);
//  });
//}

