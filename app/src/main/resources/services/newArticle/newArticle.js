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
exports.post = handlePost;
exports.put = handlePut;

function handlePut(req) {
  var me = this;

  function renderView() {
    return {
      body: '"' + articlesLib.createImage(req.params) + '"',
      contentType: "application/json"
    };
  }

  return renderView();
}

function handlePost(req) {
  var me = this;

  function renderView() {
    var result = articlesLib.createArticle(req.params);
    if (result.error) {
      var view = resolve("newArticle.html");
    } else {
      //var view = resolve("../../site/pages/article/article.html");
      var view = resolve("articleSubmit.html");
    }
    var model = createModel(result);
    var body = thymeleaf.render(view, model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel(createRes) {
    var content = portal.getContent();
    var site = portal.getSiteConfig();
    createRes = blogLib.beautifyArticle(createRes);

    var model = {
      content: content,
      site: site,
      mainRegion: false,
      sidebar: blogLib.getSidebar(),
      articleFooter: blogLib.getArticleFooter(createRes),
      content: createRes,
      errorMessage: createRes.error
        ? i18nLib.localize({
            key: "article.create.error." + createRes.message
          })
        : "",
      data: req.params,
      social: site.social,
      pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
    };

    return model;
  }

  return renderView();
}

function handleGet(req) {
  var me = this;

  function renderView() {
    var view = resolve("newArticle.html");
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
      data: up,
      social: site.social,
      pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
    };

    return model;
  }

  return renderView();
}
