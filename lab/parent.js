var ipc = require('node-ipc');

/***************************************\
 *
 * You should start both hello and world
 * then you will see them communicating.
 *
 * *************************************/

//var cp = require('child_process');
//var child = cp.fork(__dirname + '/cache.js', [], {});
//child.unref();

var node_path = require('path');
var spawn = require('child_process').spawn;

var child = spawn('node', [node_path.resolve('./cache')], {
  detached: true
});

//child.unref();

ipc.config.id    = 'hello';
ipc.config.retry = 1000;
ipc.config.sync  =  true;

ipc.connectTo('world', function() {
  ipc.of.world.on('connect', function() {
      ipc.log('## connected to world ##'.rainbow, ipc.config.delay);

      //queue up a bunch of requests to be sent synchronously
      for (var i=0; i<10; i++) {
        ipc.of.world.emit(
          'app.message',
          {
            id      : ipc.config.id,
            message : 'hello'+i
          }
        )
      }
    }
  );
  ipc.of.world.on('disconnect', function() {
    ipc.log('disconnected from world'.notice);
  });

  ipc.of.world.on('app.message', function(data) {
    ipc.log('got a message from world : '.debug, data);
  });

  console.log(ipc.of.world.destroy);
});