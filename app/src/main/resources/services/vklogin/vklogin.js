var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "../../site/lib/";
var userLib = require(libLocation + "userLib");
var norseUtils = require(libLocation + "norseUtils");

exports.get = function(req) {
  var params = req.params;
  if (params.code) {
    userLib.vkRegister(params.code);
    return {
      status: 301,
      headers: {
        Location: portal.pageUrl({ path: portal.getSite()._path })
      }
    };
  }
};
