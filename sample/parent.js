var cp = require('child_process');
var spwan = cp.spawn;

var child = spwan('node', ['sub.js', '--set'], {
    detached: false
});

//var n = cp.fork(__dirname + '/sub.js');

//n.on('message', function(m) {
//    console.log('PARENT got message:', m);
//});
//
//n.send({ hello: 'world' });