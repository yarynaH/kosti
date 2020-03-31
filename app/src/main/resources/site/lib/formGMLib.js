var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var formSharedLib = require("formSharedLib");
var common = require("/lib/xp/common");
var util = require("/lib/util");

exports.modifyGame = modifyGame;
exports.deleteGame = deleteGame;
exports.addGame = addGame;

function checkIfGameExists(data) {
  var gameBlock = contentLib.get({ key: data.blockId });
  var games = contentLib.query({
    query:
      "data.location = '" +
      data.location +
      "' and _parentPath = '/content" +
      gameBlock._path +
      "' and _name = '" +
      common.sanitize(data.displayName) +
      "'",
    start: 0,
    count: 0
  });
  if (games.total > 0) {
    return true;
  }
  return false;
}

function deleteGame(id) {
  contentLib.delete({
    key: id
  });
  contextLib.runInDraft(function() {
    contentLib.delete({
      key: id
    });
  });
}

function modifyGame(data) {
  var user = userLib.getCurrentUser();
  data.user = user._id;
  delete data.blockId;
  var game = contentLib.modify({
    key: data._id,
    editor: editor
  });
  function editor(c) {
    c.displayName = data.displayName;
    data.location = c.data.location;
    delete data.displayName;
    delete data._id;
    c.data = data;
    return c;
  }
  var result = contentLib.publish({
    keys: [game._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  return result;
}

function addGame(data) {
  if (
    formSharedLib.getLocationSpace(data.location, data.blockId).available < 1 ||
    checkIfGameExists(data)
  ) {
    return { error: true, message: "noSpace" };
  }
  var day = util.content.getParent({ key: data.location });
  var game = contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function() {
    var parent = contentLib.get({ key: data.blockId });
    var displayName = data.displayName;
    delete data.displayName;
    delete data.blockId;
    var user = userLib.getCurrentUser();
    data.user = user._id;
    var game = contentLib.create({
      name: common.sanitize(displayName),
      parentPath: parent._path,
      displayName: displayName,
      contentType: app.name + ":game",
      data: data
    });
    if (!game) {
      return { error: true, message: "unableToCreate" };
    }
    var result = contentLib.publish({
      keys: [game._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    if (!result) {
      return { error: true, message: "unableToPublish" };
    }
    return game;
  });
  return {
    error: false,
    message: "success",
    html: formSharedLib.getView("gmComp", null, { expanded: day._id })
  };
}
