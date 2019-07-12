var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var spellLib = require(libLocation + "spellsLib");
var articlesLib = require(libLocation + "articlesLib");

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
    var view = resolve("articleSubmit.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    articlesLib.createArticle(req.params);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var content = portal.getContent();
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      site: site,
      social: site.social,
      pageComponents: helpers.getPageComponents(req)
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
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      app: app,
      site: site,
      social: site.social,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
