const contextLib = require("contextLib");
const norseUtils = require("norseUtils");
const authLib = require("/lib/xp/auth");
const cacheLib = require("/lib/cache");

exports.getCache = getCache;
exports.newCache = newCache;

function getCache(params) {
  if (params.clearCache && authLib.hasRole("system.admin")) {
    params.cache.remove(params.key);
  }
  if (params.cache && params.key && !contextLib.getBranch() === "draft") {
    return params.cache.get(params.key, function () {
      return params.callback(params.data);
    });
  } else {
    return params.callback(params.data);
  }
}

function newCache(params) {
  return cacheLib.newCache({
    size: params.size,
    expire: params.expire
  });
}
