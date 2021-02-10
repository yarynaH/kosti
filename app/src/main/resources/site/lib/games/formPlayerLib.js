const norseUtils = require("../norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const userLib = require("../userLib");
const formSharedLib = require("formSharedLib");
const i18nLib = require("/lib/xp/i18n");
const util = require("/lib/util");
const contextLib = require("../contextLib");
const cartLib = require("../cartLib");
const sharedLib = require("../sharedLib");

exports.getDays = getDays;
exports.beautifyGame = beautifyGame;
exports.gameSpaceAvailable = gameSpaceAvailable;
exports.bookSpace = bookSpace;
exports.checkTicket = checkTicket;
exports.changeCartIdToPlayerId = changeCartIdToPlayerId;
exports.signForGame = signForGame;

function getDays(params) {
  let days = [];
  if (params.dayId) {
    days = getDay(params.dayId);
  } else {
    days = formSharedLib.getDays();
  }
  let gamesQuery = "";
  if (params.system) {
    gamesQuery +=
      " and data.gameSystem.select.system = '" + params.system + "'";
  }
  if (params.theme) {
    params.theme = norseUtils.forceArray(params.theme);
    gamesQuery += " AND data.theme in ('" + params.theme.join("','") + "')";
  }
  days.forEach((day) => {
    day.blocks = getGameBlocksByDay(day._id);
    day.blocks.forEach((block) => {
      block.games = formSharedLib.getItemsList({
        parentId: block._id,
        parentPathLike: true,
        type: "game",
        additionalQuery: gamesQuery
      });
      block.games.forEach((game) => {
        game = beautifyGame(game, { getBlock: false });
      });
    });
  });
  return days;
}

function getDay(id, params) {
  if (!params) {
    params = {};
  }
  let festivals = formSharedLib.getFestivals();
  let festivalId = null;
  if (festivals && festivals[0]) {
    festivalId = festivals[0]._id;
  }
  let festivalPage = contentLib.get({ key: festivalId });
  let days = contentLib.query({
    query:
      "_parentPath LIKE '/content" +
      festivalPage._path +
      "*' AND data.blockType = 'day'" +
      " AND _id = '" +
      id +
      "'",
    contentTypes: [app.name + ":gameBlock"],
    sort: "data.datetime ASC"
  }).hits;
  for (let i = 0; i < days.length; i++) {
    days[i] = formSharedLib.beautifyDay(days[i]);
  }
  return days;
}

function getGameBlocksByDay(dayId) {
  let blocks = formSharedLib.getItemsList({
    parentId: dayId,
    type: "gameBlock",
    parentPathLike: true,
    sort: "data.datetime ASC"
  });
  blocks.forEach((block) => {
    block = formSharedLib.beautifyGameBlock(null, block);
  });
  return blocks;
}

function beautifyGame(game) {
  game.seatsReserved = game.data.players
    ? norseUtils.forceArray(game.data.players).length
    : 0;
  if (game.data.gameSystem[game.data.gameSystem._selected]) {
    game.system = {
      text: game.data.gameSystem[game.data.gameSystem._selected].system,
      localizable: game.data.gameSystem._selected === "select"
    };
  } else {
    game.system = {
      text: "",
      localizable: false
    };
  }
  game.block = formSharedLib.beautifyGameBlock(
    null,
    util.content.getParent({ key: game._id })
  );
  game.additionalInfo = formSharedLib.getGameMisc(game);
  game.url = portalLib.pageUrl({ id: game._id });
  game.master = contentLib.get({ key: game.data.master });
  if (game.data.image) game.image = norseUtils.getImage(game.data.image);
  return game;
}

function gameSpaceAvailable(id) {
  let game = contentLib.get({ key: id });
  let players = norseUtils.forceArray(game.data.players);
  if (parseInt(game.data.maxPlayers) > players.length) {
    return true;
  }
  return false;
}

function checkTicket(params) {
  let cart = cartLib.getCartByQr(params.ticket);
  if (!cart) return false;
  let user = userLib.getCurrentUser();
  let currCart = null;
  let userTicket =
    user &&
    user.data &&
    user.data.kosticonnect2021 &&
    user.data.kosticonnect2021
      ? user.data.kosticonnect2021
      : null;
  if (userTicket && user.data.kosticonnect2021 === params.ticket) {
    return true;
  } else if (cart.currentFriendlyId && !cart.currentQrStatus === false) {
    return true;
  }
  return false;
}

function bookSpace(params) {
  if (!gameSpaceAvailable(params.gameId)) {
    return false;
  }
  let game = contentLib.get({ key: params.gameId });
  let players = game.data.players;
  if (!players) {
    players = [];
  }
  players = norseUtils.forceArray(players);
  let user = userLib.getCurrentUser();
  if (
    user &&
    user.data &&
    user.data.firstName &&
    user.data.discord &&
    user.data.kosticonnect2021
  ) {
    return signForGame({ gameId: params.gameId });
  } else if (
    (params.firstName || params.kosticonnect2021) &&
    user &&
    user.data.discord
  ) {
    user = updateUser(params);
    return signForGame({ gameId: params.gameId });
  } else if ((params.firstName || params.kosticonnect2021) && user) {
    user = updateUser(params);
  } else if (params.firstName && params.kosticonnect2021) {
    if (players.indexOf(params.cartId) === -1) {
      players.push(params.cartId);
      game.data.players = players;
      game = updateEntity(game);
    }
    let cart = cartLib.getCart(params.cartId);
    contextLib.runAsAdmin(function () {
      let cartRepo = sharedLib.connectRepo("cart");
      cartRepo.modify({
        key: params.cartId,
        editor: editor
      });
      function editor(node) {
        node.firstName = params.firstName;
        node.kosticonnect2021 = params.kosticonnect2021;
        node.updateGame = true;
        node.gameId = params.gameId;
        return node;
      }
    });
    return game;
  }
}

function updateUser(params) {
  if (!params) return false;
  let user = userLib.getCurrentUser();
  if (!(user && user.data)) return false;

  let updateUser = false;
  if (params.ticket && !user.data.kosticonnect2021) {
    if (checkTicket({ ticket: params.ticket })) {
      user.data.ticket = params.ticket;
      updateUser = true;
      //cartLib.markTicketUsed(params.ticket);
    } else {
      return false;
    }
  }
  if (
    (params.firstName && !user.data.firstName) ||
    (params.firstName && params.firstName !== user.data.firstName)
  ) {
    user.data.firstName = params.firstName;
    updateUser = true;
  }
  if (updateUser) user = updateEntity(user);
  return user;
}

function signForGame(params) {
  if (!params || !gameSpaceAvailable(params.gameId)) {
    return false;
  }
  let user = userLib.getCurrentUser();
  let game = contentLib.get({ key: params.gameId });
  let players = game.data.players;
  if (!players) {
    players = [];
  }
  players = norseUtils.forceArray(players);
  if (players.indexOf(user._id) === -1) {
    players.push(user._id);
    game.data.players = players;
    return updateEntity(game);
  }
  return game;
}

function changeCartIdToPlayerId(params) {
  if (!params) return false;
  let user = userLib.getCurrentUser();
  if (!user) return false;
  let game = contentLib.query({
    query: "data.players = '" + params.cartId + "'"
  });
  if (game.total > 0) game = game.hits[0];
  game.data.players = norseUtils.forceArray(game.data.players);
  if (game.data.players.indexOf(params.cart) !== -1) {
    let cart = cartLib.getCartById(params.cartId);
    user.data.firstName = cart.firstName;
    user.data.kosticonnect2021 = cart.kosticonnect2021;
    updateEntity(user);
    for (let i = 0; i < game.data.players.length; i++) {
      if (game.data.players[i] === params.cartId)
        game.data.players[i] = user._id;
      break;
    }
    updateEntity(game);
  }
  return true;
}

function updateEntity(entity) {
  return contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function () {
    entity = contentLib.modify({
      key: entity._id,
      editor: editor
    });
    function editor(c) {
      c.data = entity.data;
      return c;
    }
    contentLib.publish({
      keys: [entity._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    return entity;
  });
}
