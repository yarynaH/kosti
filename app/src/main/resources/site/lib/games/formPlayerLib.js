const norseUtils = require("../norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const userLib = require("../userLib");
const formSharedLib = require("formSharedLib");
const i18nLib = require("/lib/xp/i18n");

exports.getDays = getDays;

function getDays(params) {
  let days = formSharedLib.getDays();
  days.forEach((day) => {
    day.blocks = getGameBlocksByDay(day._id);
    day.blocks.forEach((block) => {
      block.games = formSharedLib.getItemsList({
        parentId: block._id,
        parentPathLike: true,
        type: "game"
      });
      block.games.forEach((game) => {
        game = beautifyGame(game, { getBlock: false });
      });
    });
  });
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
  let additionalInfo = [];
  if (game.data.kidsGame)
    additionalInfo.push(
      i18nLib.localize({
        key: "myGames.kidsGame"
      })
    );
  if (game.data.explicit)
    additionalInfo.push(
      i18nLib.localize({
        key: "myGames.explicit"
      })
    );
  if (game.data.beginnerFriendly)
    additionalInfo.push(
      i18nLib.localize({
        key: "myGames.beginnerFriendly"
      })
    );
  game.additionalInfo = additionalInfo.join(", ");
  if (game.data.image) game.image = norseUtils.getImage(game.data.image);
  return game;
}
