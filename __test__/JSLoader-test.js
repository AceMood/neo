/**
 * @file JS加载器功能测试
 * @Stability: 1 - Experimental
 */

describe('JSLoader', function() {
  var path = require('path');
  var JS = require('../lib/resource/JS');
  var JSLoader = require('../lib/loader/JSLoader');
  var ProjectConfiguration = require('../lib/resource/ProjectConfiguration');
  var ResourceMap = require('../lib/resource/ResourceMap');
  var loadResouce = require('../__test_helpers__/loadResource');
  var MessageList = require('../lib/MessageList');
  var waitsForCallback = require('../__test_helpers__/waitsForCallback');

  var testData = path.join(__dirname, '..', '__test_data__', 'JS');


  it('should match package.json paths', function() {
    var loader = new JSLoader();
    expect(loader.matchPath('x.js')).toBe(true);
    expect(loader.matchPath('a/x.js')).toBe(true);
    expect(loader.matchPath('a/1.css')).toBe(false);
  });

  it('should parse old school components', function() {
    loadResouce(
      new JSLoader(),
      path.join(testData, 'oldSchoolComponent.js'),
      null,
      function(errors, js) {
        expect(js.isModule).toBe(false);
        expect(js.id).toBe('oldSchoolComponent-tag');
        expect(js.requiredCSS).toEqual(['foo-css']);
      });
  });

  it('should parse modules with requires', function() {
    loadResouce(
      new JSLoader(),
      path.join(testData, 'module.js'),
      null,
      function(errors, js) {
        expect(js.isModule).toBe(true);
        expect(js.id).toBe('module-tag');
        expect(js.requiredModules).toEqual(['foo', 'bar']);
        expect(js.requiredCSS).toEqual(['foo-css']);
      });
  });

  it('should extract network size', function() {
    loadResouce(
      new JSLoader({ networkSize: true }),
      path.join(testData, 'javelin.js'),
      null,
      function(errors, js) {
        expect(js.networkSize > 0).toBe(true);
      });
  });

  it('should resolve paths using configuration', function() {
    loadResouce(
      new JSLoader(),
      path.join(testData, 'configured', 'a.js'),
      new ProjectConfiguration(
        path.join(testData, 'configured', 'package.json'),
        {}),
      function(errors, js) {
        expect(js.id).toBe(path.join('configured','a.js'));
        expect(js.requiredCSS).toEqual(['foo-css']);
      });
  });

  //it('should resolve commonJS "main" modules post process', function() {
  //  var map;
  //
  //  waitsForCallback(
  //    // test
  //    function(callback) {
  //      var loader = new JSLoader();
  //      map = new ResourceMap([
  //        // hasCustomMain dependency project
  //        JS.fromObject({
  //          id: 'hasCustomMain/folderWithMain/customMainModule.js',
  //          path: path.join(
  //            testData,
  //            'hasCustomMain',
  //            'folderWithMain',
  //            'customMainModule.js'
  //          ),
  //          requiredModules: []
  //        }),
  //        new ProjectConfiguration(
  //          path.join(testData, 'hasCustomMain', 'package.json'), {
  //            name: 'hasCustomMain',
  //            main: 'folderWithMain/customMainModule.js'
  //          }
  //        ),
  //
  //        // hasStandardIndex dependency project
  //        JS.fromObject({
  //          id: 'hasStandardIndex/index.js',
  //          path: path.join(testData, 'hasStandardIndex', 'index.js'),
  //          requiredModules: []
  //        }),
  //        new ProjectConfiguration(
  //          path.join(testData, 'hasStandardIndex', 'package.json'),
  //          {name: 'hasStandardIndex'}  // Defaults main to index.js
  //        ),
  //
  //
  //        JS.fromObject({
  //          id: 'commonJSProject/dependsOnCustomMain.js',
  //          path: path.join(
  //            testData,
  //            'commonJSProject',
  //            'dependsOnCustomMain.js'
  //          ),
  //          requiredModules: ['hasCustomMain']
  //        }),
  //        JS.fromObject({
  //          id: 'commonJSProject/dependsOnStandardIndex.js',
  //          path: path.join(
  //            testData,
  //            'commonJSProject',
  //            'dependsOnStandardIndex.js'
  //          ),
  //          requiredModules: ['hasStandardIndex']
  //        }),
  //        new ProjectConfiguration(
  //          path.join(testData, 'commonJSProject', 'package.json'),
  //          {name: 'commonJSProject'}  // Must mirror what node will *actually* find
  //        )
  //      ]);
  //
  //      loader.postProcess(map, map.getAllResourcesByType('JS'), callback);
  //    },
  //
  //    // expectation
  //    function(messages) {
  //      expect(messages).toEqual(jasmine.any(MessageList));
  //      expect(
  //        map.getResource('JS', 'commonJSProject/dependsOnCustomMain.js')
  //          .requiredModules
  //      ).toEqual(['hasCustomMain/folderWithMain/customMainModule.js']);
  //
  //      expect(
  //        map.getResource('JS', 'commonJSProject/dependsOnCustomMain.js')
  //          ._requiredTextToResolvedID
  //      ).toEqual({
  //        'hasCustomMain': 'hasCustomMain/folderWithMain/customMainModule.js'
  //      });
  //
  //      expect(
  //        map.getResource('JS', 'commonJSProject/dependsOnStandardIndex.js')
  //          .requiredModules
  //      ).toEqual(['hasStandardIndex/index.js']);
  //      expect(
  //        map.getResource('JS', 'commonJSProject/dependsOnStandardIndex.js')
  //          ._requiredTextToResolvedID
  //      ).toEqual({'hasStandardIndex': 'hasStandardIndex/index.js'});
  //    }
  //  );
  //});
  //
  //it('should resolve intern rel paths *with* package process', function() {
  //  var map;
  //
  //  waitsForCallback(
  //    // test
  //    function(callback) {
  //      var loader = new JSLoader();
  //      map = new ResourceMap([
  //        JS.fromObject({
  //          id: 'configured/a.js',
  //          path: path.join(testData, 'configured', 'a.js'),
  //          requiredModules: ['./b']   // TODO: add more interesting things here
  //        }),
  //        JS.fromObject({
  //          id: 'configured/b.js',
  //          path: path.join(testData, 'configured', 'b.js')
  //        }),
  //        new ProjectConfiguration(
  //          path.join(testData, 'configured', 'package.json'),
  //          {name: 'configured'}  // Must mirror what node will *actually* find
  //        )
  //      ]);
  //
  //      loader.postProcess(map, map.getAllResourcesByType('JS'), callback);
  //    },
  //
  //    // expectation
  //    function(messages) {
  //      expect(messages).toEqual(jasmine.any(MessageList));
  //      expect(
  //        map.getResource('JS', 'configured/a.js').requiredModules)
  //        .toEqual(['configured/b.js']
  //      );
  //      expect(
  //        map.getResource('JS', 'configured/a.js')._requiredTextToResolvedID
  //      ).toEqual({'./b': 'configured/b.js'});
  //    }
  //  );
  //});

  it('should resolve local paths without package.json', function() {
    var map;

    waitsForCallback(
      // test
      function(callback) {
        var jsLoader = new JSLoader();
        map = new ResourceMap([
          JS.fromObject({
            id: 'configured/a.js',
            path: path.join(testData, 'configured', 'a.js'),
            requiredModules: ['./b']
          }),
          JS.fromObject({
            id: 'configured/b.js',
            path: path.join(testData, 'configured', 'b.js'),
            requiredModules: []
          })
        ]);
        debugger;
        jsLoader.postProcess(map, map.getAllResources(), callback);
      },

      // expectation
      function(messages) {
        expect(messages).toEqual(jasmine.any(MessageList));
        expect(
          map.getResource('JS', 'configured/a.js').requiredModules
        ).toEqual(['configured/b.js']);
      }
    );
  });
});
