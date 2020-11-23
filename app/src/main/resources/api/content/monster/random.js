const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const cacheLib = require(libLocation + "cacheLib");
const discordMarkup = require("discordMarkup");

const cache = cacheLib.api.createGlobalCache({
  name: "monsters",
  size: 100,
  expire: 60 * 60 * 24
});

exports.get = function (req) {
  var cr = req.params.cr;
  switch (req.params.action) {
    case "monster":
      var body = {
        monster: discordMarkup.createMarkup(
          getMonster({ name: decodeURIComponent(req.params.name) })
        )
      };
      break;
    case "fight":
      var body = { monsters: generateEncounter(cr) };
      break;
    default:
      var body = { monster: getRandomMonster() };
      break;
  }
  return {
    body: body,
    contentType: "application/json"
  };

  function getRandomMonster() {
    var cacheName = cr ? "monstersCount-cr-" + cr : "monstersCount";
    var count = cache.api.getOnly(cacheName);
    if (!count) {
      count = countMonsters(cr);
      cache.api.put(cacheName, count);
    }
    return discordMarkup.createMarkup(getMonster({ count: count, cr: cr }));
  }

  function countMonsters(cr) {
    if (cr) {
      var crQuery = " and data.cr <= " + cr;
    } else {
      var crQuery = "";
    }
    var res = contentLib.query({
      start: 0,
      count: 0,
      query:
        "_parentPath = '/content" +
        getMonsterLocation()._path +
        "'and data.translated = 'true'" +
        crQuery
    });
    return res.total;
  }

  function getMonster(params) {
    var start = Math.floor(Math.random() * params.count);
    var query =
      "_parentPath = '/content" +
      getMonsterLocation()._path +
      "'and data.translated = 'true'";
    if (params.cr) {
      query += " and data.cr <= " + params.cr;
    }
    if (params.name) {
      query += " and displayName LIKE '*" + params.name + "*'";
    }
    var res = contentLib.query({
      start: start,
      count: 1,
      query: query
    });
    return res.hits[0];
  }

  function generateEncounter(cr) {
    if (!cr || cr === 0 || isNaN(cr)) {
      cr = Math.floor(Math.random() * 30);
    }
    var currCr = 0;
    var result = "";
    do {
      var temp = cr - currCr + 0.5;
      var count = countMonsters(temp);
      var monster = getMonster({ count: count, cr: temp });
      currCr += monster.data.cr;
      result += monster.displayName + ", ";
    } while (currCr <= cr - 0.0001);
    result += "общая сложность " + currCr;
    return result;
  }

  function getMonsterLocation() {
    var site = portal.getSiteConfig();
    return contentLib.get({ key: site.monstersLocation });
  }
};
