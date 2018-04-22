/* @flow */

import config from './config';
import {
  defImmutableProp
} from './utils/def';

global.neo = Object.create(null);

defImmutableProp(neo, 'run', function() {

}, true);

// neo.config.set('xxx', 'xxx');
defImmutableProp(neo, 'config', config, true);

export default neo;
