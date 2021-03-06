/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @emails javascript@lists.facebook.com voloko@fb.com
 */

/* globals describe */
/* globals it */

describe('ProjectConfiguration', function() {

  var expect = require('chai').expect;
  var ProjectConfigurationLoader =
    require('../lib/loader/ProjectConfigurationLoader');

  it('should match package.json paths', function() {
    var loader = new ProjectConfigurationLoader();
    expect(loader.matchPath('package.json')).to.be.true;
    expect(loader.matchPath('a/package.json')).to.be.true;
    expect(loader.matchPath('a/1.js')).to.be.false;
  });

});
