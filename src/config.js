/* @flow */

import { defImmutableProp } from './utils/def';
import merge from './utils/merge';

// global neo's default configurations, and it should not be accessible
// {
//   debug: boolean whether show log info
//   exclude: array some rules or directories will not be scanned
// }
let defaultOption = {
  debug: true,
  exclude: []
};

// global neo's configurations object
let _config = Object.create(null);

merge(_config, defaultOption);

/**
 * config all fields at one time
 * @param options
 */
let config = function config(options: Object) {
  merge(_config, options);
};

/**
 * usage: neo.config.set('path.to.prop', value);
 */
defImmutableProp(config, 'set', function propSetter(name: string, value: mixed) {
  let props = name.split('.');
  let lastProp = props.pop();
  let part = _config;
  props.forEach(prop => {
    if (!part[prop]) {
      part[name] = Object.create(null);
    }
    part = part[name];
  });

  part[lastProp] = value;
});

/**
 * usage: let value = neo.config.get('path.to.prop');
 */
defImmutableProp(config, 'get', function propGetter(name: string) {
  let props = name.split('.');
  let part = _config;
  let prop;
  while (prop = props.shift()) {
    try {
      part = part[prop];
    } catch (err) {
      part = void 0;
    }

    if ((part === void 0) && props.length) {
      throw `neo.config.get with non-value props ${name}`;
    }
  }

  return part;
});

/**
 * usage: let defaultOptions = neo.config.default;
 */
defImmutableProp(config, 'default', defaultOption);


export default config;
