/**
 * @module
 * @css ../css/app.css
 */

'use strict';

var warn = require('zhida/static/js/warn.js');
var footer = require('../../components/footer/footer.js');

header.init();
footer.init();

require.async(['../../components/header/header.js'], function(header) {

});