const norseUtils = require("../norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const nodeLib = require("/lib/xp/node");
const contextLib = require("../contextLib");
const userLib = require("../userLib");
const formSharedLib = require("formSharedLib");
const common = require("/lib/xp/common");
const util = require("/lib/util");
const i18nLib = require("/lib/xp/i18n");
const permissions = require("../permissions");

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

function checkIfMasterBookedThisBlock(data) {
  var gameBlock = contentLib.get({ key: data.blockId });
  var user = userLib.getCurrentUser();
  var games = contentLib.query({
    query:
      "data.location = '" +
      data.location +
      "' and _parentPath = '/content" +
      gameBlock._path +
      "' and data.master = '" +
      user._id +
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
  contextLib.runInDraft(function () {
    contentLib.delete({
      key: id
    });
  });
  return {
    error: false,
    message: i18nLib.localize({
      key: "myGames.form.message.deleted"
    })
  };
}

function modifyGame(data) {
  var user = userLib.getCurrentUser();
  data.master = user._id;
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
    var players = c.data.players;
    c.data = data;
    c.data.players = players;
    return c;
  }

  contextLib.runAsAdminAsUser(user, function () {
    contentLib.publish({
      keys: [game._id],
      sourceBranch: "master",
      targetBranch: "draft",
      includeDependencies: false
    });
  });

  var day = util.content.getParent({ key: data.location });
  return {
    error: false,
    message: i18nLib.localize({
      key: "myGames.form.message.modified"
    }),
    html: formSharedLib.getView("gmComp", null, { expanded: day._id })
  };
}

function addGame(data) {
  if (
    formSharedLib.getLocationSpace(data.location, data.blockId).available < 1 ||
    checkIfGameExists(data)
  ) {
    return {
      error: true,
      message: i18nLib.localize({
        key: "myGames.form.message.noSpace"
      })
    };
  }
  if (checkIfMasterBookedThisBlock(data)) {
    return {
      error: true,
      message: i18nLib.localize({
        key: "myGames.form.message.alreadyBooked"
      })
    };
  }
  var day = util.content.getParent({ key: data.location });
  var game = contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function () {
    var parent = contentLib.get({ key: data.blockId });
    let epiBlock = !!(parent.data.description && parent.data.title);
    var displayName = data.displayName;
    delete data.displayName;
    delete data.blockId;
    var user = userLib.getCurrentUser();
    if (!user.data.firstName) {
      userLib.editUser({ firstName: data.masterName, id: user._id });
    }
    data.master = user._id;
    var game = contentLib.create({
      name: common.sanitize(
        displayName + epiBlock ? "-" + data.masterName : ""
      ),
      parentPath: parent._path,
      displayName: displayName,
      contentType: app.name + ":game",
      data: data
    });
    if (!game) {
      return {
        error: true,
        message: i18nLib.localize({
          key: "myGames.form.message.unableToCreate"
        })
      };
    }
    contentLib.setPermissions({
      key: game._id,
      inheritPermissions: false,
      overwriteChildPermissions: true,
      permissions: permissions.full(user.key)
    });
    var result = contentLib.publish({
      keys: [game._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    if (!result) {
      return {
        error: true,
        message: i18nLib.localize({
          key: "myGames.form.message.unableToPublish"
        })
      };
    }
    return game;
  });
  return {
    error: false,
    message: i18nLib.localize({
      key: "myGames.form.message.created"
    }),
    html: formSharedLib.getView("gmComp", null, { expanded: day._id })
  };
}
