var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var votesLib = require(libLocation + "votesLib");

exports.get = function(req) {
  var params = req.params;
  switch (params.action) {
    case "fixPermissions":
      helpers.fixPermissions(params.repo);
      break;
    case "fixVotesTimestamps":
      votesLib.fixVotesTimestamps();
      break;
  }
  return {
    body: "",
    contentType: "text/html"
  };
};
