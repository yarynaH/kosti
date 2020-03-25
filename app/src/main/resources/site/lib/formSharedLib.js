var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var common = require("/lib/xp/common");
var thymeleaf = require("/lib/thymeleaf");

var baseUrl = "/site/pages/user/games/";

var views = {
  gmComp: baseUrl + "gm/gmComp.html",
  scheduleComp: baseUrl + "shared/scheduleComp.html",
  locationComp: baseUrl + "shared/locationComp.html",
  availableComp: baseUrl + "shared/availableComp.html",
  addGameForm: baseUrl + "gm/addGameForm.html",
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
    case "locationComp":
      model.locations = getLocations(id);
      break;
    case "gameBlocksComp":
      model.blocks = getGameBlocks(id);
      break;
    case "scheduleComp":
      model.blocks = getDays();
      break;
    default:
      break;
  }
  return thymeleaf.render(resolve(views[viewType]), model);
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
    var dayDate = new Date(days[i].data.datetime);
    days[i].date = dayDate.getDate().toFixed();
    days[i].dayName = norseUtils.getDayName(dayDate);
    days[i].monthName = norseUtils.getMonthName(dayDate);
    days[i].locations = getLocations(days[i]._id);
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
    blocks[i].space = getLocationSpace(locationId, blocks[i]._id);
    var duration =
      new Date(blocks[i].data.datetimeEnd) - new Date(blocks[i].data.datetime);
    var hours = Math.floor(duration / 60 / 60 / 1000);
    blocks[i].duration = {
      hours: hours.toFixed(),
      minutes: (Math.floor(duration / 60 / 1000) - hours * 60).toFixed()
    };
    blocks[i].time = {
      start: norseUtils.getTime(new Date(blocks[i].data.datetime)),
      end: norseUtils.getTime(new Date(blocks[i].data.datetimeEnd))
    };
  }
  return blocks;
}
