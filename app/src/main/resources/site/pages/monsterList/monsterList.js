var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");

exports.get = function(req) {
  var monsters = contextLib.runInDraftAsAdmin(function() {
    var monsters = contentLib.query({
      query: "",
      start: 0,
      count: -1,
      contentTypes: [app.name + ":monster"]
    });
    var result = [];
    for (var i = 0; i < monsters.hits.length; i++) {
      result.push({
        url: portal.pageUrl({ id: monsters.hits[i]._id }),
        displayName: monsters.hits[i].displayName,
        translated: monsters.hits[i].data.translated
      });
    }
    return result;
  });
  var body = thymeleaf.render(resolve("monsterList.html"), {
    pageComponents: helpers.getPageComponents(req),
    monsters: monsters
  });
  var fileName = portal.assetUrl({ path: "js/monster.js" });
  return {
    body: body,
    contentType: "text/html"
  };
};
