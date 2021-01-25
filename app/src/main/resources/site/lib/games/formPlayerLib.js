const norseUtils = require("../norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const userLib = require("../userLib");
const formSharedLib = require("formSharedLib");
const i18nLib = require("/lib/xp/i18n");

exports.getDays = getDays;

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
  game.additionalInfo = formSharedLib.getGameMisc(game);
  if (game.data.image) game.image = norseUtils.getImage(game.data.image);
  return game;
}
