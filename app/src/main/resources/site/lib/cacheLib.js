var cacheLib = require("/lib/cache");
var contentLib = require("/lib/xp/content");
var contextLib = require("/lib/xp/context");
var defaultBranch = "master";

// Using global cache
app.cache = app.cache || {};

/**
 * Creates a cache store and shares it globally
 * @param {Object} options Set of setup configurations for the new cache.
 * Available configs:
 * {
 *   name*: <name of cache>,
 *   size*: <max number of elements>,
 *   expire*: <max seconds for elements to expire>,
 *   loadingFunction: <callback for loading unexisting elements on get>,
 *   filterFunction: <callback for validating new elements on put>,
 *   idWatcher: <callback that builds a key used to remove a cached content>
 * }
 */
function createGlobalCache(options) {
  var minimumNameLen = 1;
  var minimumSize = 1;
  var minimumExpire = 30;
  var errorOptions = [];
  var existingCache;

  //Validations
  if (!options || options.toString() !== "[object Object]") {
    throw new Error("Invalid cache options: Empty configuration");
  }
  if (
    !options.name ||
    typeof options.name !== "string" ||
    options.name.length < minimumNameLen
  ) {
    errorOptions.push("name");
  }
  if (
    !options.size ||
    typeof options.size !== "number" ||
    options.name.length < minimumSize
  ) {
    errorOptions.push("size");
  }
  if (
    !options.expire ||
    typeof options.expire !== "number" ||
    options.expire.length < minimumExpire
  ) {
    errorOptions.push("expire");
  }
  if (
    !isNullOrUndefined(options.loadingFunction) &&
    typeof options.loadingFunction !== "function"
  ) {
    errorOptions.push("loadingFunction");
  }
  if (
    !isNullOrUndefined(options.filterFunction) &&
    typeof options.filterFunction !== "function"
  ) {
    errorOptions.push("filterFunction");
  }
  if (
    !isNullOrUndefined(options.idWatcher) &&
    typeof options.idWatcher !== "function"
  ) {
    errorOptions.push("idWatcher");
  }
  if (errorOptions.length > 0) {
    throw new Error("Invalid cache options: " + errorOptions.join(", "));
  }
  if ((existingCache = getGlobalCache(options.name))) {
    return existingCache;
  }

  var newCache = cacheLib.newCache({
    size: options.size,
    expire: options.expire
  });

  var cacheWrapper = {
    options: options,
    innerCache: newCache,
    api: {
      clear: function () {
        return clear(options.name);
      },
      getSize: function () {
        return getSize(options.name);
      },
      getOnly: function (key) {
        return getOnly(options.name, key);
      },
      put: function (key, contentOrGetter) {
        return put(options.name, key, contentOrGetter);
      },
      removeByKey: function (key) {
        return removeByKey(options.name, key);
      },
      removeByPattern: function (keyPattern) {
        return removeByPattern(options.name, keyPattern);
      },
      reload: function (key, branchOrGetter, validator) {
        return reload(
          options.name,
          key,
          branchOrGetter || options.loadingFunction,
          validator || options.filterFunction
        );
      },
      retrieveOnDemand: function (key, branchOrGetter, validator) {
        return retrieveOnDemand(
          options.name,
          key,
          branchOrGetter || options.loadingFunction,
          validator || options.filterFunction
        );
      }
    }
  };

  setGlobalCache(options.name, cacheWrapper);

  if (typeof options.idWatcher === "function") {
    log.info(
      'Global cache "' +
        options.name +
        '" is now watching changes from repository "cms-repo"'
    );
  }

  return cacheWrapper;
}

function getGlobalCache(cacheName) {
  return app.cache[cacheName];
}

function setGlobalCache(cacheName, cacheValue) {
  app.cache[cacheName] = cacheValue;
}

function isNullOrUndefined(obj) {
  return obj === null || obj === undefined;
}

function validateRequired(cacheName, method, paramName, paramValue) {
  if (isNullOrUndefined(paramValue)) {
    throw new Error(
      cacheName +
        "." +
        method +
        ': parameter "' +
        paramName +
        '" must not be null nor undefined'
    );
  }
}

function checkRequired(cacheName, method, paramName, paramValue) {
  if (isNullOrUndefined(paramValue)) {
    log.error(
      cacheName +
        "." +
        method +
        ': parameter "' +
        paramName +
        '" must not be null nor undefined'
    );
    return false;
  }
  return true;
}

/**
 * Returns the size of cache for a specific key
 * @param {String} cacheName
 */
function getSize(cacheName) {
  return getGlobalCache(cacheName).innerCache.getSize() || 0;
}

/**
 * Remove content on cache by key, and returns if something was really removed
 * @param {String} cacheName
 * @param {String} key
 */
function removeByKey(cacheName, key) {
  var content = getOnly(cacheName, key);
  getGlobalCache(cacheName).innerCache.remove(key);
  return !!content;
}

/**
 * Remove content on cache by key pattern
 * @param {String} cacheName
 * @param {String} keyPattern
 */
function removeByPattern(cacheName, keyPattern) {
  getGlobalCache(cacheName).innerCache.removePattern(keyPattern);
}

/**
 * Returns the content related to key only if it's cached
 * @param {String} cacheName
 * @param {String} key
 */
function getOnly(cacheName, key) {
  var noop = function () {
    return null;
  };
  try {
    validateRequired(cacheName, "getOnly", "key", key);
    return getGlobalCache(cacheName).innerCache.get(key, noop);
  } catch (e) {
    return false;
  }
}

/**
 * Returns the content related to key from cache if it's cached, otherwise retrieves it using content lib
 * @param {String} cacheName
 * @param {String} key
 * @param {String} [branchOrGetter] - Optional (default branch: 'master')
 * @param {Function} [validator] - Optional
 */
function retrieveOnDemand(cacheName, key, branchOrGetter, validator) {
  var retrieve = function () {
    //Validate param
    validateRequired(cacheName, "retrieveOnDemand", "key", key);

    //Get content
    var content;
    if (typeof branchOrGetter === "function") {
      content = branchOrGetter(key);
    } else {
      var branch =
        typeof branchOrGetter === "string" ? branchOrGetter : defaultBranch;
      content = contentLib.get({
        key: key,
        branch: branch
      });
      if (isNullOrUndefined(content)) {
        throw new Error(
          'retrieveOnDemand: content not found for key "' +
            key +
            '" on branch "' +
            branch +
            '"'
        );
      }
    }

    //Validate result
    if (typeof validator === "function") {
      content = validator(key, content);
    }

    return content;
  };
  try {
    return getGlobalCache(cacheName).innerCache.get(key, retrieve);
  } catch (e) {
    log.error(e.message);
  }
}

/**
 * Returns the content related to key overwriting the current content on cache
 * @param {String} cacheName
 * @param {String} key
 * @param {String} [branchOrGetter] - Optional (default branch: 'master')
 * @param {Function} [validator] - Optional
 */
function reload(cacheName, key, branchOrGetter, validator) {
  if (!checkRequired(cacheName, "reload", "key", key)) return;

  getGlobalCache(cacheName).innerCache.remove(key);
  return retrieveOnDemand(cacheName, key, branchOrGetter, validator);
}

/**
 * Force content to be stored
 * @param {String} cacheName
 * @param {String} key
 * @param {(Object|Function)} contentOrGetter
 */
function put(cacheName, key, contentOrGetter) {
  var retrieve = function () {
    var content =
      typeof contentOrGetter === "function"
        ? contentOrGetter()
        : contentOrGetter;
    return content;
  };
  var context = contextLib.get();
  if (context && context.branch === "draft") {
    return retrieve;
  }
  try {
    validateRequired(cacheName, "put", "key", key);
    validateRequired(cacheName, "put", "contentOrGetter", contentOrGetter);
    return getGlobalCache(cacheName).innerCache.get(key, retrieve);
  } catch (e) {
    log.error(e.message);
  }
}

/**
 * Clear all cached content
 * @param {String} cacheName
 */
function clear(cacheName) {
  getGlobalCache(cacheName).innerCache.clear();
}

module.exports = {
  api: {
    getPreloaded: function (key) {
      return getOnly("mirrorCache", key);
    },
    createGlobalCache: createGlobalCache,
    getGlobalCache: getGlobalCache
  }
};
