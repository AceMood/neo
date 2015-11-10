
'use strict';

var node_path = require('path');
var fs = require('fs');

function File(path, type) {
  this.path = path;
  this._path = node_path.resolve(path);
  this.type = type;
  this.content = '';

  this.getContent();
}

File.prototype.getContent = function() {
  try {
    this.content = fs.readFileSync(this._path, 'utf8');
  } catch (e) {
    this.content = '';
  }
};

module.exports = File;