var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var formPlayerLib = require(libLocation + "formPlayerLib");

exports.get = function(req) {
  var result = {};
  switch (req.params.action) {
    case "getView":
      result.html = formPlayerLib.getView(req.params.viewType);
      break;
    default:
      break;
  }
  return {
    body: result,
    contentType: "application/json"
  };
};
