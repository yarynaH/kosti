var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var libs = {
  context: require("/lib/xp/context")
};

var libLocation = "../../lib/";
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var spellLib = require(libLocation + "spellsLib");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("monster.html");
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
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
