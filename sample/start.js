
var Neo = require('../lib/Neo');

var neo = new Neo(
  [
    new JSLoader(),
    new CSSLoader()
  ],
  [
    "static",
    "components"
  ]
);

neo.update('map.json', function(map) {

});