var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");

exports.get = function(req) {
  var result = null;
  var params = req.params;
  switch (params.action) {
    case "single":
      result = getSingleMonster(params.id);
      break;
    default:
      result = getMonstersList();
      break;
  }

  return {
    body: result,
    contentType: "application/json"
  };

  function getSingleMonster(id) {
    var monster = contentLib.get({ key: id });
    var monsterData = monster.data;
    monsterData.name = monster.displayName;
    monsterData.id = monster._id;
    return monsterData;
  }

  function getMonstersList() {
    var monsters = contentLib.query({
      query: "",
      start: 0,
      count: -1,
      contentTypes: [app.name + ":monster"]
    });
    var result = [];
    for (var i = 0; i < monsters.hits.length; i++) {
      result.push({
        hitPoints: monsters.hits[i].data.hitPoints,
        name: monsters.hits[i].displayName,
        type: monsters.hits[i].data.type,
        size: monsters.hits[i].data.size,
        challengeRating: monsters.hits[i].data.challengeRating,
        id: monsters.hits[i]._id
      });
    }
    return result;
  }
};
