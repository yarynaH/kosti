var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");

exports.post = function(req) {
  var data = JSON.parse(req.params.data);
  editMonster(data);
  return true;

  function editMonster(data) {
    var displayName = data.name;
    var id = data.id;
    delete data.name;
    delete data.id;
    contextLib.runInDraftAsAdmin(function() {
      var result = contentLib.modify({
        key: id,
        editor: editor
      });
      contentLib.publish({
        keys: [id],
        sourceBranch: "draft",
        targetBranch: "master"
      });
      function editor(c) {
        c.displayName = displayName;
        c.data.actions = data.actions;
        c.data.legendaryActions = data.legendaryActions;
        c.data.reactions = data.reactions;
        c.data.specialAbilities = data.specialAbilities;
        c.data.damageImmunities = data.damageImmunities;
        c.data.damageResistances = data.damageResistances;
        c.data.damageVulnerabilities = data.damageVulnerabilities;
        c.data.conditionImmunities = data.conditionImmunities;
        c.data.type = data.type;
        c.data.subType = data.subType;
        c.data.group = data.group;
        c.data.alignment = data.alignment;
        c.data.armorDesc = data.armorDesc;
        c.data.languages = data.languages;
        c.data.senses = data.senses;
        c.data.translated = true;
        return c;
      }
    });
  }
};

exports.get = function(req) {
  //doImport();
  doFix();

  function doFix() {
    for (var p = 1; p < 23; p++) {
      norseUtils.log(p);
      var data = JSON.parse(
        httpClientLib.request({
          url: "https://api.open5e.com/monsters/?page=" + p,
          method: "GET",
          connectionTimeout: 2000000,
          readTimeout: 500000
        }).body
      );
      data = data.results;
      for (var i = 0; i < data.length; i++) {
        fixMonster(data[i]);
      }
    }
    function fixMonster(data) {
      var monster = contentLib.query({ query: "_name = '" + data.slug + "'" });
      if (monster && monster.hits && monster.hits[0]) {
        var id = monster.hits[0]._id;
      } else {
        return false;
      }
      return contextLib.runInDraftAsAdmin(function() {
        var result = contentLib.modify({
          key: id,
          editor: editor
        });
        contentLib.publish({
          keys: [id],
          sourceBranch: "draft",
          targetBranch: "master"
        });
        return result;
      });
      function editor(c) {
        c.data.constitution = data.constitution;
        c.data.charisma = data.charisma;
        return c;
      }
    }
  }

  function doImport() {
    for (var p = 1; p < 23; p++) {
      norseUtils.log(p);
      var data = JSON.parse(
        httpClientLib.request({
          url: "https://api.open5e.com/monsters/?page=" + p,
          method: "GET",
          connectionTimeout: 2000000,
          readTimeout: 500000
        }).body
      );
      data = data.results;
      for (var i = 0; i < data.length; i++) {
        var tempData = prepareData(data[i]);
        createMonster(tempData);
      }
    }

    function createMonster(data) {
      var site = portal.getSiteConfig();
      var monstersLocation = contentLib.get({ key: site.monstersLocation });
      var displayName = data.name;
      var name = data.slug;
      delete data.slug;
      delete data.name;
      return contextLib.runInDraftAsAdmin(function() {
        var result = contentLib.create({
          name: name,
          parentPath: monstersLocation._path,
          displayName: displayName,
          contentType: app.name + ":monster",
          data: data
        });
        return result;
      });
    }

    function prepareData(data) {
      var mappedData = {};
      if (data.skills) {
        mappedData.skills = {
          perception: data.skills.perception,
          stealth: data.skills.stealth,
          acrobatics: data.skills.acrobatics,
          performance: data.skills.performance,
          survival: data.skills.survival,
          athletics: data.skills.athletics,
          intimidation: data.skills.intimidation,
          nature: data.skills.nature,
          insight: data.skills.insight,
          investigation: data.skills.investigation,
          deception: data.skills.deception,
          history: data.skills.history,
          religion: data.skills.religion,
          arcana: data.skills.arcana,
          medicine: data.skills.medicine,
          sleightOfHand: data.skills.sleightOfHand,
          animalHandling: data.skills.animalHandling,
          persuasion: data.skills.persuasion
        };
      }
      if (data.speed) {
        mappedData.speed = {
          climb: data.speed.climb,
          fly: data.speed.fly,
          walk: data.speed.walk,
          swim: data.speed.swim,
          burrow: data.speed.burrow
        };
      }

      mappedData.armorClass = data.armor_class;
      mappedData.hitPoints = data.hit_points;
      mappedData.hitDice = data.hit_dice;
      mappedData.alignmentOld = data.alignment;
      mappedData.challengeRating = data.challenge_rating;
      mappedData.armorDesc = data.armor_desc;
      mappedData.size = data.size.toLowerCase();
      mappedData.languages = data.languages;
      mappedData.senses = data.senses;
      mappedData.constitution = data.constitution;
      mappedData.charisma = data.charisma;
      mappedData.dexterity = data.dexterity;
      mappedData.intelligence = data.intelligence;
      mappedData.wisdom = data.wisdom;
      mappedData.strength = data.strength;
      mappedData.charismaSave = data.charisma_save;
      mappedData.constitutionSave = data.constitution_save;
      mappedData.dexteritySave = data.dexterity_save;
      mappedData.intelligenceSave = data.intelligence_save;
      mappedData.strengthSave = data.strength_save;
      mappedData.wisdomSave = data.wisdom_save;
      mappedData.spellList = data.spell_list;
      mappedData.actions = data.actions
        ? prepareActionsArray(data.actions)
        : null;
      mappedData.legendaryActions = data.legendary_actions
        ? prepareActionsArray(data.legendary_actions)
        : null;
      mappedData.reactions = data.reactions
        ? prepareActionsArray(data.reactions)
        : null;
      mappedData.specialAbilities = data.special_abilities
        ? prepareActionsArray(data.special_abilities)
        : null;
      mappedData.damageVulnerabilities = data.damage_vulnerabilities;
      mappedData.damageResistances = data.damage_resistances;
      mappedData.damageImmunities = data.damage_immunities;
      mappedData.conditionImmunities = data.condition_immunities;
      mappedData.typeOld = data.type;
      mappedData.subType = data.subtype;
      mappedData.group = data.group;
      mappedData.slug = data.slug;
      mappedData.name = data.name;

      return mappedData;

      function prepareActionsArray(actions) {
        actions = norseUtils.forceArray(actions);
        for (var i = 0; i < actions.length; i++) {
          delete actions[i].attack_bonus;
          delete actions[i].damage_dice;
          delete actions[i].damage_bonus;
        }
        return actions;
      }
    }
  }
};
