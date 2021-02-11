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
exports.signForGame = signForGame;
exports.updateUser = updateUser;
exports.updateEntity = updateEntity;
exports.signOutOfGame = signOutOfGame;
exports.checkPlayersCartsBooking = checkPlayersCartsBooking;

function getDays(params) {
  if (!params) params = {};
  let days = [];
  if (params.day) {
    days = getDay(params.day);
  } else {
    days = formSharedLib.getFirstDay();
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
  if (
    !parseInt(params.kosticonnect2021) ||
    parseInt(params.kosticonnect2021) === NaN
  ) {
    return false;
  }
  return false;
  let cart = cartLib.getCartByQr(params.kosticonnect2021);
  if (!cart) return false;
  let user = userLib.getCurrentUser();
  let userTicket =
    user && user.data && user.data.kosticonnect2021
      ? user.data.kosticonnect2021
      : null;
  if (userTicket && user.data.kosticonnect2021 === params.kosticonnect2021) {
    return true;
  } else if (cart.currentFriendlyId && !cart.qrActivated) {
    return true;
  }
  return false;
}

function bookSpace(params) {
  if (!gameSpaceAvailable(params.gameId)) {
    return { error: true, message: "Мест больше нет." };
  }
  let game = contentLib.get({ key: params.gameId });
  let players = game.data.players;
  if (!players) {
    players = [];
  }
  players = norseUtils.forceArray(players);
  let user = userLib.getCurrentUser();
  if (params.kosticonnect2021) {
    if (parseInt(params.kosticonnect2021) === NaN) {
      return {
        error: true,
        message: "Не правильный номер билета."
      };
    }
    if (!checkTicket(params)) {
      return {
        error: true,
        message: "Такой билет не существует, или уже активирован."
      };
    }
  }
  if (!validateTicketGameAllowed(params.kosticonnect2021, game._id)) {
    return {
      error: true,
      message: "Ваш билет не позволяет принять участие в этой игре."
    };
  }
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
    saveDataToCart({
      game: game,
      firstName: user.data.firstName,
      kosticonnect2021: user.data.kosticonnect2021,
      players: players,
      cartId: params.cartId
    });
    return game;
  } else if (params.firstName && params.kosticonnect2021) {
    saveDataToCart({
      game: game,
      firstName: params.firstName,
      kosticonnect2021: params.kosticonnect2021,
      players: players,
      cartId: params.cartId
    });
    return game;
  }
}

function saveDataToCart(params) {
  if (params.players.indexOf(params.cartId) === -1) {
    params.players.push(params.cartId);
    params.game.data.players = params.players;
    params.game = updateEntity(params.game);
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
      node.gameId = params.game._id;
      return node;
    }
  });
  return params.game;
}

function updateUser(params) {
  if (!params) return false;
  let user = userLib.getCurrentUser();
  if (!(user && user.data)) return false;

  let updateUser = false;
  if (params.kosticonnect2021 && !user.data.kosticonnect2021) {
    if (parseInt(params.kosticonnect2021) === NaN) {
      return {
        error: true,
        message: "Не правильный номер билета."
      };
    }
    if (checkTicket({ kosticonnect2021: params.kosticonnect2021 })) {
      user.data.kosticonnect2021 = params.kosticonnect2021;
      updateUser = true;
      cartLib.markTicketUsed(params.kosticonnect2021);
    } else {
      return {
        error: true,
        message: "Такой билет не существует, или уже активирован."
      };
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
    return { error: true, message: "Мест больше нет." };
  }
  let user = userLib.getCurrentUser();
  let game = contentLib.get({ key: params.gameId });
  if (!validateTicketGameAllowed(user.data.kosticonnect2021, game._id)) {
    return {
      error: true,
      message: "Ваш билет не позволяет принять участие в этой игре."
    };
  }
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

function signOutOfGame(params) {
  if (!params) {
    return false;
  }
  let user = userLib.getCurrentUser();
  let game = contentLib.get({ key: params.gameId });
  let players = game.data.players;
  if (!players) {
    players = [];
  }
  players = norseUtils.forceArray(players);
  let index = players.indexOf(user._id);
  if (index > -1) {
    players.splice(index, 1);
    game.data.players = players;
    return updateEntity(game);
  }
  return game;
}

function validateTicketGameAllowed(ticketId, gameId) {
  let game = contentLib.get({ key: gameId });
  if (!game.data.exclusive) return true;
  let cart = cartLib.getCartByQr(ticketId);
  if (cart.legendary) return true;
  return false;
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

function checkPlayersCartsBooking() {
  let games = getListOfGames();
  games.forEach((game) => {
    checkGamePlayers(game);
  });
}

function getListOfGames() {
  var date = new Date();
  date.setTime(date.getTime() - 60 * 60 * 1000);
  let games = contentLib.query({
    start: 0,
    count: -1,
    query: "data.date < dateTime('" + date.toISOString() + "')",
    contentTypes: [app.name + "game"]
  });
}

function checkGamePlayers(game) {
  if (game.data.players) return true;
  game.data.players = norseUtils.forceArray(game.data.players);
  if (game.players.length < 1) return true;
  let updateGame = false;

  let players = game.data.players;
  players.forEach((player) => {
    let user = contentLib.get({ key: player });
    if (!(user && user.type === app.name + ":user")) {
      let index = players.indexOf(player);
      if (index > -1) {
        players.splice(index, 1);
      }
    }
  });
  game.data.players = players;
  if (updateGame) return updateEntity(game);
  return game;
}
