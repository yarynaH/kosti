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
      sort: "displayName ASC",
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
  var fileNames = portal.assetUrl({ path: "encounterBuilder/src.9535b111.js" });
  var fileNamess = portal.assetUrl({
    path: "encounterBuilder/src.a35a9c10.css"
  });
  return {
    body: body,
    contentType: "text/html",
    pageContributions: {
      bodyEnd: ["<script src='" + fileNames + "'></script>"],
      headBegin: ["<link rel='stylesheet' href='" + fileNamess + "'>"]
    }
  };
};
