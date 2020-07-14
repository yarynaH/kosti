var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
const cacheLib = require(libLocation + "cacheLib");

const cache = cacheLib.api.createGlobalCache({
  name: "monsters",
  size: 1000,
  expire: 60 * 60 * 24
});

exports.get = function (req) {
  var result = null;
  var params = req.params;
  switch (params.action) {
    case "single":
      result = getSingleMonsterFromCache(params.id);
      break;
    default:
      result = getMonstersFromCache();
      break;
  }

  return {
    body: result,
    contentType: "application/json"
  };

  function getSingleMonsterFromCache(id) {
    var monster = cache.api.getOnly(id);
    if (!monster) {
      monster = getSingleMonster(id);
      cache.api.put(id, monster);
    }
    return monster;
  }

  function getSingleMonster(id) {
    var monster = contentLib.get({ key: id });
    var monsterData = monster.data;
    monsterData.name = monster.displayName;
    monsterData.id = monster._id;
    monsterData.specialAbilities = norseUtils.forceArray(
      monsterData.specialAbilities
    );
    monsterData.reactions = norseUtils.forceArray(monsterData.reactions);
    monsterData.actions = norseUtils.forceArray(monsterData.actions);
    monsterData.legendaryActions = norseUtils.forceArray(
      monsterData.legendaryActions
    );
    return monsterData;
  }

  function getMonstersList() {
    var monsters = contentLib.query({
      query: "data.translated = 'true'",
      start: 0,
      count: -1,
      contentTypes: [app.name + ":monster"]
    });
    var result = [];
    for (var i = 0; i < monsters.hits.length; i++) {
      result.push({
        name: monsters.hits[i].displayName,
        type: monsters.hits[i].data.type,
        size: monsters.hits[i].data.size,
        challengeRating: monsters.hits[i].data.challengeRating,
        id: monsters.hits[i]._id
      });
    }
    return result;
  }

  function getMonstersFromCache() {
    var monsters = cache.api.getOnly("list");
    if (!monsters) {
      monsters = getMonstersList();
      cache.api.put("list", monsters);
    }
    return monsters;
  }
};
