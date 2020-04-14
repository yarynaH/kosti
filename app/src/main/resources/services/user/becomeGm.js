var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");

exports.get = function(req) {
  var user = userLib.getCurrentUser();
  if (!user) {
    return helpers.getLoginRequest();
  }
  userLib.addRole("gameMaster", user.key);
  return {
    status: 301,
    headers: {
      Location: portal.pageUrl({
        path: user._path,
        params: { action: "games" }
      })
    }
  };
};
