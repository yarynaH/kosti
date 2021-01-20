const norseUtils = require("norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const nodeLib = require("/lib/xp/node");
const contextLib = require("contextLib");
const userLib = require("userLib");
const common = require("/lib/xp/common");
const thymeleaf = require("/lib/thymeleaf");
const util = require("/lib/util");
const cacheLib = require("cacheLib");

const cache = cacheLib.api.createGlobalCache({
  name: "users",
  size: 1000,
  expire: 60 * 60 * 24
});

var baseUrl = "/site/pages/user/games/";

var views = {
  gmComp: baseUrl + "gm/gmComp.html",
  scheduleComp: baseUrl + "shared/scheduleComp.html",
  locationAndGameBlockComp: baseUrl + "gm/locationBlocksWrapper.html",
  availableComp: baseUrl + "shared/availableComp.html",
  addGameForm: baseUrl + "gm/addGameForm.html",
  locationComp: baseUrl + "shared/locationComp.html",
  gameBlocksComp: baseUrl + "gm/gameBlocksComp.html"
};

exports.getView = getView;
exports.getItemsList = getItemsList;
exports.getDays = getDays;
exports.getLocations = getLocations;
exports.getLocationSpace = getLocationSpace;
exports.getFestivalByDay = getFestivalByDay;
exports.getFestivalByDays = getFestivalByDays;

function getView(viewType, id, params) {
  var model = {};
  switch (viewType) {
    case "locationAndGameBlockComp":
      model = getLocationsGameBlocksModel(id);
      break;
    case "gameBlocksComp": {
      let day = util.content.getParent({ key: id });
      model.blocks = getGameBlocks(id);
      model.festival = getFestivalByDay(day._id);
      break;
    }
    case "scheduleComp":
      model.days = getDays(params);
      model.festival = getFestivalByDays(model.days);
      break;
    case "addGameForm":
      model = getFormComponent(id);
      break;
    case "gmComp":
      model.days = getView("scheduleComp", null, params);
      break;
    default:
      break;
  }
  return thymeleaf.render(resolve(views[viewType]), model);
}

function getFormComponent(id) {
  var content = contentLib.get({ key: id });
  let user = userLib.getCurrentUser();
  let discord = null;
  if (user && user.data && user.data.discord) {
    discord = userLib.getDiscordData(user._id);
    discord = cache.api.getOnly(user._id + "-discord");
    if (!discord) {
      discord = userLib.getDiscordData(user._id);
      if (discord) cache.api.put(user._id + "-discord", discord);
    }
  }
  if (content.type === app.name + ":game") {
    var game = beautifyGame(content);
    var location = contentLib.get({ key: game.data.location });
    var block = beautifyGameBlock(
      location._id,
      util.content.getParent({ key: game._id })
    );
    var action = "editGame";
  } else {
    var action = "addGame";
    var game = null;
    var location = util.content.getParent({ key: id });
    var block = beautifyGameBlock(location._id, contentLib.get({ key: id }));
  }
  let day = beautifyDay(util.content.getParent({ key: location._id }));
  return {
    action: action,
    game: game,
    block: block,
    discord: discord,
    location: location,
    user: user,
    virtualTables: getSelectOptions("virtualTable"),
    gameSystems: getSelectOptions("gameSystem"),
    themes: getSelectOptions("theme"),
    festival: getFestivalByDay(day._id),
    day: day
  };
}

function getLocationsGameBlocksModel(id) {
  let locations = getLocations(id);
  let festival = getFestivalByDay(id);
  locations[0].active = true;
  return {
    locations: thymeleaf.render(resolve(views["locationComp"]), {
      locations: locations,
      festival: festival
    }),
    gameBlocks: thymeleaf.render(resolve(views["gameBlocksComp"]), {
      blocks: getGameBlocks(locations[0]._id),
      festival: festival
    }),
    festival: festival
  };
}

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
    total: parseInt(location.data.maxGames).toFixed(),
    reserved: parseInt(games.total).toFixed(),
    available: (parseInt(location.data.maxGames) - games.total).toFixed()
  };
}

function getItemsList(filters) {
  var query = "type = '" + app.name + ":" + filters.type + "' ";
  if (filters.user) {
    query += "AND data.user = '" + filters.user + "'";
  }
  if (filters.location) {
    query += "AND data.location = '" + filters.location + "'";
  }
  if (filters.parentId) {
    var parent = contentLib.get({ key: filters.parentId });
    if (filters.parentPathLike) {
      query += "and _parentPath like '/content" + parent._path + "*'";
    } else {
      query += "and _parentPath = '/content" + parent._path + "'";
    }
  }
  if (filters.additionalQuery) {
    query += filters.additionalQuery;
  }
  return contentLib.query({
    query: query,
    start: 0,
    count: -1
  }).hits;
}

function getFestivals() {
  var site = portalLib.getSite();
  return getItemsList({
    type: "landing",
    parentId: site._id,
    additionalQuery: " AND data.gameRegisterOpen = 'true'"
  });
}

function getDays(params) {
  if (!params) {
    var params = {};
  }
  var festivals = getFestivals();
  if (festivals && festivals[0]) {
    var id = festivals[0]._id;
  }
  var festivalPage = contentLib.get({ key: id });
  var days = contentLib.query({
    query:
      "_parentPath LIKE '/content" +
      festivalPage._path +
      "*' AND data.blockType = 'day'",
    contentTypes: [app.name + ":gameBlock"]
  }).hits;
  for (var i = 0; i < days.length; i++) {
    days[i] = beautifyDay(days[i], params.expanded);
  }
  return days;
}

function getLocations(dayId) {
  return getItemsList({
    parentId: dayId,
    type: "gamesLocation"
  });
}

function getGameBlocks(locationId) {
  var blocks = getItemsList({
    parentId: locationId,
    type: "gameBlock"
  });
  for (var i = 0; i < blocks.length; i++) {
    blocks[i] = beautifyGameBlock(locationId, blocks[i]);
  }
  return blocks;
}

function beautifyGameBlock(locationId, block) {
  block.space = getLocationSpace(locationId, block._id);
  var duration =
    new Date(block.data.datetimeEnd) - new Date(block.data.datetime);
  var hours = Math.floor(duration / 60 / 60 / 1000);
  block.duration = {
    hours: hours.toFixed(),
    minutes: (Math.floor(duration / 60 / 1000) - hours * 60).toFixed()
  };
  block.time = {
    start: norseUtils.getTime(new Date(block.data.datetime)),
    end: norseUtils.getTime(new Date(block.data.datetimeEnd))
  };
  return block;
}

function beautifyDay(day, expanded) {
  if (expanded === day._id) {
    day.expanded = true;
  }
  day.games = getDaysByUser(day._id);
  var dayDate = new Date(day.data.datetime);
  day.date = dayDate.getDate().toFixed();
  day.dayName = norseUtils.getDayName(dayDate);
  day.monthName = norseUtils.getMonthName(dayDate);
  day.locations = getLocations(day._id);
  day.space = getDaySpace(day._id);
  let festival = getFestivalByDay(day._id);
  day.available = thymeleaf.render(resolve(views["availableComp"]), {
    games: day.games,
    festival: festival
  });
  return day;
}

function getDaysByUser(parent) {
  var user = userLib.getCurrentUser();
  var games = getItemsList({
    user: user._id,
    parentId: parent,
    parentPathLike: true,
    type: "game"
  });
  for (var i = 0; i < games.length; i++) {
    games[i] = beautifyGame(games[i]);
  }
  return games;
}

function beautifyGame(game) {
  var gameBlock = util.content.getParent({ key: game._id });
  var location = util.content.getParent({ key: gameBlock._id });
  game.block = beautifyGameBlock(location._id, gameBlock);
  game.location = location.displayName;
  game.table = getGameTable(game._id, game.block);
  game.seatsReserver = game.data.players
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
  return game;
}

function getGameTable(id, block) {
  var games = getItemsList({ type: "game", parentId: block._id });
  for (var i = 0; i < games.length; i++) {
    if (games[i]._id === id) {
      return (i + 1).toFixed();
    }
  }
  return false;
}

function getDaySpace(dayId) {
  var dayLocations = getLocations(dayId);
  var space = {
    total: 0,
    reserved: 0
  };
  for (var i = 0; i < dayLocations.length; i++) {
    var blocks = getGameBlocks(dayLocations[i]._id);
    for (var j = 0; j < blocks.length; j++) {
      space = {
        total: space.total + parseInt(blocks[j].space.total),
        reserved: space.reserved + parseInt(blocks[j].space.reserved)
      };
    }
  }
  space = {
    total: parseInt(space.total).toFixed(),
    reserved: parseInt(space.reserved).toFixed()
  };
  return space;
}

function getFestivalByDay(id) {
  let gamesFolder = util.content.getParent({ key: id });
  if (gamesFolder) {
    let festival = util.content.getParent({ key: gamesFolder._id });
    if (festival && festival.data) {
      festival.online = festival.data && festival.data.onlineFestival;
      return festival;
    }
  }
  return null;
}

function getFestivalByDays(arr) {
  arr = norseUtils.forceArray(arr);
  if (arr[0] && arr[0]._id) {
    return getFestivalByDay(arr[0]._id);
  } else if (arr[0] && typeof arr[0] === "string") {
    return getFestivalByDay(arr[0]);
  }
}

function getSelectOptions(inputName) {
  let type = contentLib.getType(app.name + ":game");
  let result = [];
  type.form.forEach((f) => {
    if (f.name === inputName) {
      if (f.formItemType === "Input") {
        f.config.option.forEach((o) => {
          result.push(o["@value"]);
        });
      } else {
        f.options.forEach((o) => {
          if (o.name === "select") {
            o.items[0].config.option.forEach((i) => {
              result.push(i["@value"]);
            });
          }
        });
      }
    }
  });
  return result;
}
