/* @flow */

import defineProp from './utils/def';
import merge from './utils/merge';

let _config = Object.create(null);
let config = Object.create(null);

defineProp(config, 'set', function setter(key: string, value: mixed) {

});

defineProp(config, 'get', function getter(key: string) {
  return _config.key ? _config.key : null;
});
