var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var spellLib = require(libLocation + "spellsLib");
var articlesLib = require(libLocation + "articlesLib");
var blogLib = require(libLocation + "blogLib");

exports.get = handleGet;

function handleGet(req) {
  var me = this;

  function renderView() {
    var view = resolve("newMonster.html");
    var user = userLib.getCurrentUser();
    if (!user) {
      return false;
    }
    var model = createModel();
    var body = thymeleaf.render(view, model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var up = req.params;
    if (!up) {
      up = {};
    }
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      app: app,
      site: site,
      agreementPage: portal.pageUrl({
        id: portal.getSiteConfig().agreementPage
      }),
      data: up,
      social: site.social,
      pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
    };

    return model;
  }

  return renderView();
}
