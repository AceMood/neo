/* @flow */

const node_fs = require('fs');
const node_path = require('path');
const exists = node_fs.existsSync;

/**
 * create a directory for specific path
 * @param  path directory path
 * @param  mode path created mode
 */
export default function mkdirp(path: string, mode?: number) {
  if (exists(path)) {
    return;
  }

  let _0777 = parseInt('0777', 8);
  if (!mode) {
    mode = _0777 & (~process.umask());
  }

  path.split(node_path.sep).reduce((prev, next) => {
    if (prev && !exists(prev)) {
      node_fs.mkdirSync(prev, mode);
    }
    return `${prev}${node_path.sep}${next}`;
  });

  if (!exists(path)) {
    node_fs.mkdirSync(path, mode);
  }
};