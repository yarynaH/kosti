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
  gameBlocksComp: baseUrl + "gm/gameBlocksComp.html"
};

exports.getView = getView;

function getView(viewType) {
  return thymeleaf.render(resolve(views[viewType]), {});
}
