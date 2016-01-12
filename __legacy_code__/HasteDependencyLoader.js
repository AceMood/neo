
/**
 * Simple utility for automating the loading and ordered traversal of
 * dependencies, given some form of a starting point resource.
 */

/**
 * A marker to mark modules as being currently visited. Helps breaks circular
 * dependencies when recursing.
 */
var CURRENTLY_VISITING = {};

/**
 * @param {object} orderedResources Lookup map of already traversed nodes
 * @param {Resource} resource Haste Resource object.
 * @param {ResourceMap} map Haste resource map.
 */
var debugResourceVisit = function(orderedResources, resource, map) {
  console.log(
    '[node-haste] module(' + resource.id + ') => ',
    resource.requiredModules
  );
  for (var j = 0; j < resource.requiredModules.length; j++) {
    var dependencyMod = resource.requiredModules[j];
    if (orderedResources[dependencyMod.id]) {
      var msg =
        orderedResources[dependencyMod.id] === CURRENTLY_VISITING ?
        '[node-haste]   Not traversing CIRCULAR DEPENDENCY:' :
        '[node-haste]   Not traversing already orderedResources:';
      console.log(msg, dependencyMod.requiredModules[j]);
    }
    if (!map.getResource('JS', resource.requiredModules[j])) {
      console.log('[node-haste]   Not found:', resource.requiredModules[j]);
    }
  }
};


/**
 * Recurses through required modules graph.
 * @param {ResourceMap} map 资源表
 * @param {Resource} resource 入口资源模块
 * @param {object} orderedResources
 * @param {boolean} debug
 */
var getOrderedDependencies = function(map, resource, orderedResources, debug) {
  if (!resource || !resource.id || orderedResources[resource.id]) {
    return;
  }
  orderedResources[resource.id] = CURRENTLY_VISITING; // Break circ deps.
  debug && debugResourceVisit(orderedResources, resource, map);
  for (var i = 0; i < resource.requiredModules.length; i++) {
    var dependencyResource = map.getResource('JS', resource.requiredModules[i]);
    getOrderedDependencies(map, dependencyResource, orderedResources, debug);
  }
  orderedResources[resource.id] = resource;
};

/**
 * Using a provided `Haste` instance, discovers the ordered set of dependencies
 * for `options.rootJSPath`. Invokes the `options.done` callback with the
 * ordered resources and the resolved resource ID `options.rootJSPath`.
 *
 * @param {object} options Object containing options: {
 *   @property {Haste} haste Configured haste instance.
 *   @property {ResourceMap} resourceMap ResourceMap to reuse.
 *   @property {string} rootJSPath Path of root JS file to load dependencies of.
 *   @property {function} done Invoked as done(err, rootID, orderedResources)
 *   @property {boolean} debug Should debug package dependencies.
 * }
 */
var loadOrderedDependencies = function(options) {
  var rootJSPath = options.rootJSPath;
  var rootDependencies = options.rootDependencies;
  var debug = options.debug;
  options.haste.updateMap(options.resourceMap, function(newResourceMap) {
    // 记录排序资源
    var orderedResources = {};
    if (rootDependencies) {
      for (var i = 0; i < rootDependencies.length; i++) {
        var dependency = newResourceMap.getResource('JS', rootDependencies[i]);
        getOrderedDependencies(
          newResourceMap, dependency, orderedResources, debug
        );
      }
    }
    var resource = newResourceMap.getResourceByPath(rootJSPath);
    if (!resource) {
      var msg = 'Following module not in specified search paths: ' + rootJSPath;
      return options.done(new Error(msg));
    }
    getOrderedDependencies(newResourceMap, resource, orderedResources, debug);
    options.done(null, resource.id, orderedResources);
  });
};

var HasteDependencyLoader = {
  loadOrderedDependencies: loadOrderedDependencies
};

module.exports = HasteDependencyLoader;
