'use strict';

var _def = require('./utils/def');

var _def2 = _interopRequireDefault(_def);

var _merge = require('./utils/merge');

var _merge2 = _interopRequireDefault(_merge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _config = Object.create(null);
let config = Object.create(null);

(0, _def2.default)(config, 'set', function setter(key, value) {});

(0, _def2.default)(config, 'get', function getter(key) {
  return _config.key ? _config.key : null;
});