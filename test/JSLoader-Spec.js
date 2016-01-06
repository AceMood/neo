/**
 * The MIT License (MIT)
 * Copyright (c) 2015 AceMood
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file JS加载器功能测试
 * @author AceMood
 * @Stability: 1 - Experimental
 */

describe('JSLoader', function() {
  var node_path = require('path');
  var JS = require('../lib/resource/JS');
  var JSLoader = require('../lib/loader/JSLoader');
  var ProjectConfiguration = require('../lib/resource/ProjectConfiguration');
  var ResourceMap = require('../lib/resource/ResourceMap');
  var MessageList = require('../lib/MessageList');
  var expect = require('chai').expect;

  var testData = node_path.join(__dirname, '..', '__test_data__', 'JS');

  it('should match package.json paths', function() {
    var loader = new JSLoader();
    expect(loader.matchPath('x.js')).to.be.true;
    expect(loader.matchPath('a/x.js')).to.be.true;
    expect(loader.matchPath('a/1.css')).to.be.false;
  });

  it('should parse old school components', function(done) {
    var loader = new JSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'oldSchoolComponent.js'),
      null,
      function(e, r) {
        expect(r.isModule).to.be.false;
        expect(r.id).to.equal('oldSchoolComponent-tag');
        expect(r.requiredCSS).to.be.a('array');
        expect(r.requiredCSS).to.have.length(1);
        expect(r.requiredCSS).to.deep.equal(['foo-css']);
        expect(e).instanceOf(MessageList);

        done();
      });
  });

  it('should parse modules with requires', function(done) {
    var loader = new JSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'module.js'),
      null,
      function(e, r) {
        expect(r.isModule).to.be.true;
        expect(r.id).to.equal('module-tag');
        expect(r.requiredModules).to.be.a('array');
        expect(r.requiredModules).to.have.length(2);
        expect(r.requiredModules).to.deep.equal(['foo', 'bar']);
        expect(r.requiredCSS).to.be.a('array');
        expect(r.requiredCSS).to.have.length(1);
        expect(r.requiredCSS).to.deep.equal(['foo-css']);
        expect(e).instanceOf(MessageList);

        done();
      });
  });

  it('should extract network size', function(done) {
    var loader = new JSLoader({ networkSize: true });
    loader.loadFromPath(
      node_path.join(testData, 'javelin.js'),
      null,
      function(e, r) {
        expect(r.networkSize > 0).to.be.true;
        expect(e).instanceOf(MessageList);

        done();
      });
  });

  it('should resolve paths using configuration', function(done) {
    var loader = new JSLoader();
    loader.loadFromPath(
      node_path.join(testData, 'configured', 'a.js'),
      new ProjectConfiguration(
        node_path.join(testData, 'configured', 'package.json'),
        {}),
      function(e, r) {
        expect(r.id).to.equal(node_path.join('configured','a.js'));
        expect(r.requiredCSS).to.be.a('array');
        expect(r.requiredCSS).to.have.length(1);
        expect(r.requiredCSS).to.deep.equal(['foo-css']);
        expect(e).instanceOf(MessageList);

        done();
      });
  });

  it('should resolve commonJS "main" modules post process', function(done) {
    var loader = new JSLoader();
    var map = new ResourceMap([
      // hasCustomMain dependency project
      JS.fromObject({
        id: 'hasCustomMain/folderWithMain/customMainModule.js',
        path: node_path.join(
          testData,
          'hasCustomMain',
          'folderWithMain',
          'customMainModule.js'
        ),
        requiredModules: []
      }),
      new ProjectConfiguration(
        node_path.join(testData, 'hasCustomMain', 'package.json'), {
          name: 'hasCustomMain',
          main: 'folderWithMain/customMainModule.js'
        }
      ),

      // hasStandardIndex dependency project
      JS.fromObject({
        id: 'hasStandardIndex/index.js',
        path: node_path.join(testData, 'hasStandardIndex', 'index.js'),
        requiredModules: []
      }),
      new ProjectConfiguration(
        node_path.join(testData, 'hasStandardIndex', 'package.json'),
        {name: 'hasStandardIndex'}  // Defaults main to index.js
      ),


      JS.fromObject({
        id: 'commonJSProject/dependsOnCustomMain.js',
        path: node_path.join(
          testData,
          'commonJSProject',
          'dependsOnCustomMain.js'
        ),
        requiredModules: ['hasCustomMain']
      }),
      JS.fromObject({
        id: 'commonJSProject/dependsOnStandardIndex.js',
        path: node_path.join(
          testData,
          'commonJSProject',
          'dependsOnStandardIndex.js'
        ),
        requiredModules: ['hasStandardIndex']
      }),
      new ProjectConfiguration(
        node_path.join(testData, 'commonJSProject', 'package.json'),
        {name: 'commonJSProject'}  // Must mirror what node will *actually* find
      )
    ]);

    loader.postProcess(map, map.getAllResourcesByType('JS'), function(messages) {
      expect(messages).instanceOf(MessageList);
      expect(
        map.getResource('JS', 'commonJSProject/dependsOnCustomMain.js')
          .requiredModules
      ).to.deep.equal(['hasCustomMain/folderWithMain/customMainModule.js']);

      expect(
        map.getResource('JS', 'commonJSProject/dependsOnCustomMain.js')
          ._requiredTextToResolvedID
      ).to.deep.equal({
          'hasCustomMain': 'hasCustomMain/folderWithMain/customMainModule.js'
        });

      expect(
        map.getResource('JS', 'commonJSProject/dependsOnStandardIndex.js')
          .requiredModules
      ).to.deep.equal(['hasStandardIndex/index.js']);
      expect(
        map.getResource('JS', 'commonJSProject/dependsOnStandardIndex.js')
          ._requiredTextToResolvedID
      ).to.deep.equal({'hasStandardIndex': 'hasStandardIndex/index.js'});

      done();
    });
  });

  it('should resolve intern rel paths *with* package process', function(done) {
    var loader = new JSLoader();
    var map = new ResourceMap([
      JS.fromObject({
        id: 'configured/a.js',
        path: node_path.join(testData, 'configured', 'a.js'),
        requiredModules: ['./b']   // TODO: add more interesting things here
      }),
      JS.fromObject({
        id: 'configured/b.js',
        path: node_path.join(testData, 'configured', 'b.js')
      }),
      new ProjectConfiguration(
        node_path.join(testData, 'configured', 'package.json'),
        {name: 'configured'}  // Must mirror what node will *actually* find
      )
    ]);

    loader.postProcess(map, map.getAllResourcesByType('JS'), function(messages) {
      expect(messages).instanceOf(MessageList);
      expect(
        map.getResource('JS', 'configured/a.js').requiredModules)
        .to.deep.equal(['configured/b.js']
      );
      expect(
        map.getResource('JS', 'configured/a.js')._requiredTextToResolvedID
      ).to.deep.equal({'./b': 'configured/b.js'});

      done();
    });
  });

  it('should resolve local paths without package.json', function(done) {
    var jsLoader = new JSLoader();
    var map = new ResourceMap([
      JS.fromObject({
        id: 'configured/a.js',
        path: node_path.join(testData, 'configured', 'a.js'),
        requiredModules: ['./b']
      }),
      JS.fromObject({
        id: 'configured/b.js',
        path: node_path.join(testData, 'configured', 'b.js'),
        requiredModules: []
      })
    ]);
    jsLoader.postProcess(map, map.getAllResources(), function(messages) {
      expect(messages).instanceOf(MessageList);
      expect(
        map.getResource('JS', 'configured/a.js').requiredModules
      ).to.deep.equal(['configured/b.js']);

      done();
    });
  });
});