var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var common = require("/lib/xp/common");

exports.modifyGame = modifyGame;
exports.deleteGame = deleteGame;
exports.addGame = addGame;
exports.getLocationSpace = getLocationSpace;

function getLocationSpace(locationId, gameBlockId) {
  var location = contentLib.get({ key: locationId });
  var gameBlock = contentLib.get({ key: gameBlockId });
  var games = contentLib.query({
    query:
      "data.location = '" +
      locationId +
      "' and _parentPath = '/content" +
      gameBlock._path +
      "'",
    start: 0,
    count: 0
  });
  return {
    total: parseInt(location.data.maxGames),
    reserved: games.total,
    available: (parseInt(location.data.maxGames) - games.total).toFixed()
  };
}

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
    getLocationSpace(data.location, data.blockId).available < 1 ||
    checkIfGameExists(data)
  ) {
    return false;
  }
  return contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function() {
    var parent = contentLib.get({ key: data.blockId });
    var displayName = data.displayName;
    delete data.displayName;
    delete data.blockId;
    var game = contentLib.create({
      name: common.sanitize(displayName),
      parentPath: parent._path,
      displayName: displayName,
      contentType: app.name + ":game",
      data: data
    });
    var result = contentLib.publish({
      keys: [game._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    return result;
  });
}
