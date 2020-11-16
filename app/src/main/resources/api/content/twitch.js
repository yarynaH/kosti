const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");

exports.get = function (req) {
  if (req.params.nice) {
    return {
      body: thymeleaf.render(resolve("charsheet.html"), {
        content: getSingleMonsterFromCache(req.params.id),
        app: app,
        pageComponents: helpers.getPageComponents(req)
      }),
      contentType: "text/html"
    };
  } else {
    return {
      body: getSingleMonsterFromCache(req.params.id),
      contentType: "application/json"
    };
  }

  function getSingleMonsterFromCache(id) {
    return getSingleMonster(id);
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
    monster.data = monsterData;
    monster.data.strMod = getModifier(monster.data.strength);
    monster.data.dexMod = getModifier(monster.data.dexterity);
    monster.data.conMod = getModifier(monster.data.constitution);
    monster.data.wisMod = getModifier(monster.data.wisdom);
    monster.data.intMod = getModifier(monster.data.intelligence);
    monster.data.chaMod = getModifier(monster.data.charisma);
    return monster;
  }

  function getModifier(value) {
    return Math.floor((parseInt(value) - 10) / 2);
  }
};
