var portal = require("/lib/xp/portal");
var contextLib = require("/lib/contextLib");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var formLib = require(libLocation + "formLib");

exports.post = function(req) {
  var action = req.params.action;
  delete req.params.action;
  var result = {};
  switch (action) {
    case "addGame":
      /*
        title: displayName and _name
        blockId: parent, where data is created
        description
        maxPlayers
        kidsGame: true || false
        system: game system(dnd, vtm, etc.)
        masterName
        masterNickname
      */
      break;
    default:
      break;
  }
  return {
    body: result,
    contentType: "application/json"
  };
};
