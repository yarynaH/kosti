var portal = require("/lib/xp/portal");
var contextLib = require("/lib/contextLib");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var formLib = require(libLocation + "formLib");

exports.post = function(req) {
  var params = req.params;
  var result = {};
  switch (params.action) {
    default:
      break;
  }
  return {
    body: result,
    contentType: "application/json"
  };
};
