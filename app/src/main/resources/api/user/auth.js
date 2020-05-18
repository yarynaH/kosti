var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");

exports.get = function (req) {
  var site = portal.getSite();
  var discordUrl = "https://discordapp.com/api/oauth2/authorize?";
  discordUrl += "client_id=605493268326776853";
  discordUrl +=
    "&redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    "user/auth/discord";
  discordUrl += "&response_type=code";
  discordUrl += "&scope=email%20identify";
  var vkUrl =
    "https://oauth.vk.com/authorize?" +
    "client_id=7018935&scope=4194304&" +
    "redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    "user/auth/vk" +
    "&v=5.102";
  var view = resolve(
    "/site/pages/components/user/" + req.params.type + ".html"
  );
  return {
    body: {
      html: thymeleaf.render(view, { discordUrl: discordUrl, vkUrl: vkUrl }),
      selector: ".js_" + req.params.type
    },
    contentType: "application/json"
  };
};

exports.put = function (req) {
  return {
    body: userLib.register(
      req.params.username,
      req.params.email,
      req.params.password
    ),
    contentType: "application/json"
  };
};

exports.post = function (req) {
  return {
    body: userLib.login(req.params.username, req.params.password),
    contentType: "application/json"
  };
};
