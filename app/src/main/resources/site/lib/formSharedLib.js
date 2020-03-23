var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var common = require("/lib/xp/common");

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

function getView(viewType) {
  return thymeleaf.render(resolve(views[viewType]), {});
}

function getItemsList(filters) {
  var query = "type = '" + app.name + ":" + filters.type + "'";
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
  var games = contentLib.query({
    query: query,
    start: 0,
    count: -1
  });
  return games.hits;
}
