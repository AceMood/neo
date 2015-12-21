var cp = require('child_process');

cp.exec('ls', {

}, function(error, stdout, stderr) {

    debugger;
    console.log(stdout.toString());
});