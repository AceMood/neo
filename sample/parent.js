var cp = require('child_process');
var spawn = cp.spawn;

console.log(__dirname);

var child = spawn('node', [__dirname + '/sub.js', '--set'], {
    detached: true
});

// child.unref();

//child.send({ hello: 'world' });

//var n = cp.fork(__dirname + '/sub.js');

//n.on('message', function(m) {
//    console.log('PARENT got message:', m);
//});
//
//n.send({ hello: 'world' });
