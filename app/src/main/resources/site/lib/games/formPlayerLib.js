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
const cacheLib = require("../cacheLib");

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
exports.updateGameDate = updateGameDate;

const festivalCache = cacheLib.api.createGlobalCache({
  name: "festival",
  size: 10000,
  expire: 60 * 60 * 24
});

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
      let games = block.games;
      for (let i = 0; i < games.length; i++) {
        games[i] = beautifyGame(games[i], { getBlock: false });
      }
      block.games = games;
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
  for (let i = 0; i < blocks.length; i++) {
    blocks[i] = beautifyGameBlock(null, blocks[i]);
  }
  return blocks;
}

function beautifyGame(game) {
  let tempGame = festivalCache.api.getOnly(game._id);
  if (!tempGame) {
    game = beautifyGameGeneralData(game);
    festivalCache.api.put(game._id, game);
  } else {
    game = tempGame;
  }
  game.seatsReserved = game.data.players
    ? norseUtils.forceArray(game.data.players).length
    : 0;
  return game;
}

function beautifyGameGeneralData(game) {
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
  game.block = beautifyGameBlock(
    null,
    util.content.getParent({ key: game._id })
  );
  game.additionalInfo = formSharedLib.getGameMisc(game);
  game.url = portalLib.pageUrl({ id: game._id });
  game.intro =
    game.data.description.replace(/(<([^>]+)>)/gi, "").substring(0, 250) +
    "...";
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

function validateUser(game) {
  let user = userLib.getCurrentUser();
  if (!user) return { error: true, message: "Вам нужно войти." };
  let kosticonnect2021 = user.data.kosticonnect2021;
  let discord = user.data.discord;
  let gameBlock = util.content.getParent({ key: game._id });
  let games = contentLib.query({
    start: 0,
    count: -1,
    query:
      "data.players = '" +
      user._id +
      "' and _parentPath = '" +
      gameBlock._path +
      "'",
    contentTypes: [app.name + "game"]
  });
  if (game.total > 0)
    return {
      error: true,
      message: "Вы уже записаны на другую игру в этом блоке."
    };
  if (
    !(
      discord &&
      (kosticonnect2021 || user.roles.gameMaster || user.roles.moderator)
    )
  )
    return {
      error: true,
      message: "Вам нужен билет чтоб записатся."
    };
  if (!validateTicketGameAllowed(kosticonnect2021, game._id)) {
    return {
      error: true,
      message: "Ваш билет не позволяет принять участие в этой игре."
    };
  }
  return {
    error: false
  };
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
    let signInResult = signForGame({ gameId: params.gameId });
    if (!signInResult.error) {
      return { error: false, message: "Вы записаны на игру." };
    }
  } else if (
    (params.firstName || params.kosticonnect2021) &&
    user &&
    user.data.discord
  ) {
    user = updateUser(params);
    let signInResult = signForGame({ gameId: params.gameId });
    if (!signInResult.error) {
      return { error: false, message: "Вы записаны на игру." };
    }
  } else if ((params.firstName || params.kosticonnect2021) && user) {
    user = updateUser(params);
    saveDataToCart({
      game: game,
      firstName: user.data.firstName,
      kosticonnect2021: user.data.kosticonnect2021,
      players: players,
      cartId: params.cartId
    });
    return { error: false, message: false };
  } else if (params.firstName && params.kosticonnect2021) {
    saveDataToCart({
      game: game,
      firstName: params.firstName,
      kosticonnect2021: params.kosticonnect2021,
      players: players,
      cartId: params.cartId
    });
    return { error: false, message: false };
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
      contextLib.runAsAdminAsUser(user, function () {
        cartLib.markTicketUsed(params.kosticonnect2021);
      });
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
  let userValid = validateUser(game);
  if (userValid.error) {
    return userValid;
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
  norseUtils.log("fixing booking");
  contextLib.runAsAdmin(function () {
    let games = getListOfGames();
    games.forEach((game) => {
      checkGamePlayers(game);
    });
  });
  norseUtils.log("finished");
}

function getListOfGames() {
  var date = new Date();
  date.setTime(date.getTime() - 60 * 60 * 1000);
  let games = contentLib.query({
    start: 0,
    count: -1,
    contentTypes: [app.name + ":game"]
  });
  return games.hits;
}

function checkGamePlayers(game) {
  if (!game.data.players) return true;
  let players = norseUtils.forceArray(game.data.players);
  if (players.length === 0) return true;

  let updateGame = false;
  for (let i = 0; i < players.length; i++) {
    let user = contentLib.get({ key: players[i] });
    if (!(user && user.type === app.name + ":user")) {
      let index = players.indexOf(players[i]);
      if (index > -1) {
        norseUtils.log("found wrong player for game " + game._id);
        players.splice(index, 1);
        updateGame = true;
        i--;
      }
    }
  }
  game.data.players = players;
  if (updateGame) return updateEntity(game);
  return game;
}

function updateGameDate() {
  norseUtils.log("fixing game dates");
  contextLib.runAsAdmin(function () {
    let games = getListOfGames();
    games.forEach((game) => {
      fixGameDate(game);
    });
  });
  norseUtils.log("finished");
}

function fixGameDate(game) {
  if (game.data.datetime) return true;
  let gameBlock = util.content.getParent({ key: game._id });
  game.data.datetime = gameBlock.data.datetime;
  updateEntity(game);
}

function beautifyGameBlock(locationId, block) {
  let tempBlock = festivalCache.api.getOnly(block._id);
  if (!tempBlock) {
    block = getBlockCache(block);
    festivalCache.api.put(block._id, block);
  } else {
    block = tempBlock;
  }
  if (locationId) {
    block.space = getLocationSpace(locationId, block._id);
  }
  return block;
}

function getBlockCache(block) {
  block.duration = {};
  if (block.data.datetimeEnd && block.data.datetime) {
    var duration =
      new Date(block.data.datetimeEnd) - new Date(block.data.datetime);
    var hours = Math.floor(duration / 60 / 60 / 1000);
    block.duration = {
      hours: hours.toFixed(),
      minutes: (Math.floor(duration / 60 / 1000) - hours * 60).toFixed()
    };
  }
  var blockDate = new Date(block.data.datetime);
  block.date = blockDate.getDate().toFixed();
  block.dayName = norseUtils.getDayName(blockDate);
  block.monthName = norseUtils.getMonthName(blockDate);
  block.time = {
    start: norseUtils.getTime(new Date(block.data.datetime)),
    end: block.data.datetimeEnd
      ? norseUtils.getTime(new Date(block.data.datetimeEnd))
      : null
  };
  block.epic = !!(block.data.description && block.data.title);
  return block;
}
