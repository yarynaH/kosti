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

exports.get = handleGet;
exports.post = handlePost;
exports.put = handlePut;

function handlePut(req) {
  var me = this;

  function renderView() {
    return {
      body: articlesLib.createImage(req.params),
      contentType: "application/json"
    };
  }

  return renderView();
}

function handlePost(req) {
  var me = this;

  function renderView() {
    var article = articlesLib.createArticle(JSON.parse(req.params.data));
    var result;
    if (article.error) {
      result = {
        error: true,
        message: i18nLib.localize({
          key: "user.newArticle.error." + article.message,
          locale: "ru"
        })
      };
    } else {
      result = {
        error: false,
        message: i18nLib.localize({
          key: "user.newArticle.success",
          locale: "ru"
        })
      };
    }
    return {
      body: result,
      contentType: "application/json"
    };
  }

  return renderView();
}

function handleGet(req) {
  var me = this;

  function renderView() {
    var view = resolve("newArticleNew.html");
    var user = userLib.getCurrentUser();
    if (!user) {
      return {
        body: helpers.getLoginRequest(),
        contentType: "text/html"
      };
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
      sidebar: blogLib.getSidebar(),
      social: site.social,
      author: userLib.getCurrentUser(),
      date: kostiUtils.getTimePassedSincePostCreation(new Date()),
      pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
    };

    return model;
  }

  return renderView();
}
