var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");

exports.get = handleGet;
exports.put = handlePut;

function handlePut(req) {
  createArticle(req.params);
  return renderView(req);

  function createArticle(data) {
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
    social: site.social,
    pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
  });
  return {
    body: body,
    contentType: "text/html"
  };
}
