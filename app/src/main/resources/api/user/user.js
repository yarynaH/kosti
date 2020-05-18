var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var userLib = require(libLocation + "userLib");

exports.post = function (req) {
  return {
    body: userLib.editUser(req.params),
    contentType: "application/json"
  };
};
