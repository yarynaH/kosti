var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");

exports.post = function (req) {
  return {
    body: userLib.jwtRegister(req.params.token),
    contentType: "application/json"
  };
};
