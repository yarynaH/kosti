var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");

exports.get = function (req) {
  if (req.params.code) {
    userLib.discordRegister(req.params.code, "become-gm");
  }
  var user = userLib.getCurrentUser();
  if (!user || !user.data || !user.data.discord) {
    return helpers.getLoginRequest({
      type: "kosticonnect",
      showDiscord: true,
      redirect: "become-gm"
    });
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
