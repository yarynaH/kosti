var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var formGMLib = require(libLocation + "formGMLib");
var formSharedLib = require(libLocation + "formSharedLib");

exports.post = function(req) {
  var result = {};
  switch (req.params.action) {
    case "addGame":
      var data = JSON.parse(req.params.data);
      data.gameSystem = {
        select: { system: data.gameSystem },
        _selected: "select"
      };
      data.description = "test descr";
      norseUtils.log(data);
      formGMLib.addGame(data);
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
      var data = {
        _id: "82f0b63d-27b8-4319-bfd5-cba2b99778cc",
        displayName: "new game",
        description: "new game is super cool",
        maxPlayers: 4,
        kidsGame: true,
        explicit: false,
        gameSystem: { select: { system: "dnd" }, _selected: "select" },
        masterName: "ivan"
      };
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
      var id = "ffebc45a-3b73-4cd1-816f-8b62883509e1";
      formGMLib.deleteGame(id);
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
