var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var spellLib = require(libLocation + "spellsLib");
var articlesLib = require(libLocation + "articlesLib");
var blogLib = require(libLocation + "blogLib");
var contextLib = require(libLocation + "contextLib");
var sharedLib = require(libLocation + "sharedLib");
var statusPage = require("status");

exports.post = handlePost;

function handlePost(req) {
  var me = this;
  var user = userLib.getCurrentUser();
  var result = false;
  if (!user) {
    return helpers.getLoginRequest();
  }
  if (!isArticleValid(req.params.id)) {
    return statusPage.get(req);
  }
  if (articlesLib.deleteArticle(req.params.id)) {
    result = true;
  }
  return {
    body: { success: result },
    contentType: "application/json"
  };

  function isArticleValid(id) {
    var status = blogLib.getArticleStatus(req.params.id);
    var user = userLib.getCurrentUser();
    if (!status.exists) {
      return false;
    }
    if (status.published) {
      return false;
    }
    if (!(status.exists && (status.author || user.moderator))) {
      return false;
    }
    return true;
  }
}
