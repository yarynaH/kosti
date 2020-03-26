var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var common = require("/lib/xp/common");
var thymeleaf = require("/lib/thymeleaf");
var util = require("/lib/util");

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

function getView(viewType, id) {
  var model = {};
  switch (viewType) {
    case "locationAndGameBlockComp":
      model = getLocationsGameBlocksModel(id);
      break;
    case "gameBlocksComp":
      model.blocks = getGameBlocks(id);
      break;
    case "scheduleComp":
      model.blocks = getDays();
      break;
    case "addGameForm":
      model = getFormComponent(id);
      break;
    default:
      break;
  }
  return thymeleaf.render(resolve(views[viewType]), model);
}

function getFormComponent(blockId) {
  var location = util.content.getParent({ key: blockId });
  return {
    block: beautifyGameBlock(location._id, contentLib.get({ key: blockId })),
    location: location,
    day: beautifyDay(util.content.getParent({ key: location._id }))
  };
}

function getLocationsGameBlocksModel(id) {
  var locations = getLocations(id);
  locations[0].active = true;
  return {
    locations: thymeleaf.render(resolve(views["locationComp"]), {
      locations: locations
    }),
    gameBlocks: thymeleaf.render(resolve(views["gameBlocksComp"]), {
      blocks: getGameBlocks(locations[0]._id)
    })
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
    total: parseInt(location.data.maxGames),
    reserved: games.total,
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
    query += "and _parentPath = '/content" + parent._path + "'";
  }
  return contentLib.query({
    query: query,
    start: 0,
    count: -1
  }).hits;
}

function getDays() {
  var id = "21e95588-90aa-411d-84a7-d11508b46e5c";
  var festivalPage = contentLib.get({ key: id });
  var days = contentLib.query({
    query:
      "_parentPath LIKE '/content" +
      festivalPage._path +
      "*' AND data.blockType = 'day'",
    contentTypes: [app.name + ":gameBlock"]
  }).hits;
  for (var i = 0; i < days.length; i++) {
    days[i] = beautifyDay(days[i]);
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

function beautifyDay(day) {
  var dayDate = new Date(day.data.datetime);
  day.date = dayDate.getDate().toFixed();
  day.dayName = norseUtils.getDayName(dayDate);
  day.monthName = norseUtils.getMonthName(dayDate);
  day.locations = getLocations(day._id);
  day.space = getDaySpace(day._id);
  return day;
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
        total: space.total + blocks[j].space.total,
        reserved: space.reserved + blocks[j].space.reserved
      };
    }
  }
  space = {
    total: space.total.toFixed(),
    reserved: space.reserved.toFixed()
  };
  return space;
}
