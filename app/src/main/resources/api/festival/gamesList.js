var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");
var formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = function (req) {
  norseUtils.log(req.params);
  return {
    body: {},
    contentType: "application/json"
  };
};
