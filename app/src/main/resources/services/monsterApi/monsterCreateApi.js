var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var monsterLib = require(libLocation + "monsterLib");

exports.get = function (req) {
  var result = {};
  var params = req.params;
  result.html = monsterLib.getActionComponent(params.id);
  norseUtils.log(req.params);

  return {
    body: result,
    contentType: "application/json"
  };
};
