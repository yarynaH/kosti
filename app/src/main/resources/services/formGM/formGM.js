var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var formGMLib = require(libLocation + "formGMLib");
var formSharedLib = require(libLocation + "formSharedLib");

exports.post = function(req) {
  var result = {};
  var data = JSON.parse(req.params.data);
  var action = data.action;
  delete data.action;
  switch (action) {
    case "addGame":
      norseUtils.log(data);
      result = formGMLib.addGame(data);
      /*
        displayName: displayName and _name
        blockId: parent, where data is created
        description
        maxPlayers
        locationId
        kidsGame: true || false
        explicit: true || false
        system: game system(dnd, vtm, etc.)
        masterName
        masterNickname
      */
      break;
    case "editGame":
      formGMLib.modifyGame(data);
      /*
        _id
        displayName: displayName and _name
        description
        maxPlayers
        kidsGame: true || false
        explicit: true || false
        system: game system(dnd, vtm, etc.)
        masterName
        masterNickname
      */
      break;
    case "deleteGame":
      formGMLib.deleteGame(data.id);
      /*
        id
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

exports.get = function(req) {
  var result = {};
  switch (req.params.action) {
    case "getView":
      result.html = formSharedLib.getView(req.params.viewType, req.params.id);
      break;
    default:
      break;
  }
  return {
    body: result,
    contentType: "application/json"
  };
};
