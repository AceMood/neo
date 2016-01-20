'use strict';

const node_path = require('path');
const fs = require('fs');
const spawn = require('child_process').spawn;

const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const child = spawn('node', [node_path.resolve('./detach-c')], {
  detached: true,
  stdio: [ 'ignore', out, err ]
});

child.unref();

//let i = 1;
//setInterval(function() {
//  console.log(i++);
//}, 1000);