var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");

exports.get = function (req) {
  var result = {};
  var params = req.params;
  norseUtils.log(req.params);

  return {
    body: result,
    contentType: "application/json"
  };
};
