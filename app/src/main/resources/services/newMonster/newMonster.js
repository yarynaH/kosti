var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var articlesLib = require(libLocation + "articlesLib");
var hashtagLib = require(libLocation + "hashtagLib");
var blogLib = require(libLocation + "blogLib");
var sharedLib = require(libLocation + "sharedLib");
var monsterLib = require(libLocation + "monsterLib");

exports.get = handleGet;

function handleGet(req) {
  var view = resolve("../../site/pages/monster/monster.html");
  var inputs = monsterLib.getInputs();
  var body = thymeleaf.render(view, {
    pageComponents: helpers.getPageComponents(req, null, null, "Новая статья"),
    inputs: inputs
  });
  return {
    body: body,
    contentType: "text/html"
  };
}
