var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");
var common = require("/lib/xp/common");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");

exports.get = handleGet;
exports.post = handlePost;

function handlePost(req) {
  req.params = prepareSkills(req.params);
  req.params = prepareSpeed(req.params);
  createMonster(req.params);
  return renderView(req);

  function createMonster(data) {
    var site = portal.getSiteConfig();
    var monstersLocation = contentLib.get({ key: site.monstersLocation });
    var displayName = data.name;
    var name = common.sanitize(data.name);
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

  function prepareSpeed(data) {
    data.speed = {
      climb: data.climb,
      fly: data.fly,
      walk: data.walk,
      swim: data.swim,
      burrow: data.burrow
    };

    delete data.fly;
    delete data.walk;
    delete data.swim;
    delete data.burrow;
    delete data.climb;
    return data;
  }

  function prepareSkills(data) {
    data.skills = {
      perception: data.perception,
      stealth: data.stealth,
      acrobatics: data.acrobatics,
      performance: data.performance,
      survival: data.survival,
      athletics: data.athletics,
      intimidation: data.intimidation,
      nature: data.nature,
      insight: data.insight,
      investigation: data.investigation,
      deception: data.deception,
      history: data.history,
      religion: data.religion,
      arcana: data.arcana,
      medicine: data.medicine,
      sleightOfHand: data.sleightOfHand,
      animalHandling: data.animalHandling,
      persuasion: data.persuasion
    };

    delete data.perception;
    delete data.stealth;
    delete data.acrobatics;
    delete data.performance;
    delete data.survival;
    delete data.athletics;
    delete data.intimidation;
    delete data.nature;
    delete data.insight;
    delete data.investigation;
    delete data.deception;
    delete data.history;
    delete data.religion;
    delete data.arcana;
    delete data.medicine;
    delete data.sleightOfHand;
    delete data.animalHandling;
    delete data.persuasion;
    return data;
  }
}

function handleGet(req) {
  return renderView(req);
}

function renderView(req) {
  var view = resolve("newMonster.html");
  var site = portal.getSiteConfig();
  var body = thymeleaf.render(view, {
    app: app,
    site: site,
    pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
  });
  return {
    body: body,
    contentType: "text/html"
  };
}
