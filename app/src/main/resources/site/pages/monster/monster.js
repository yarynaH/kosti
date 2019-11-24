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
var contextLib = require(libLocation + "contextLib");

exports.get = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("monster.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/monster.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = contextLib.runInDraftAsAdmin(function() {
      return portal.getContent();
    });
    content.data.actions = norseUtils.forceArray(content.data.actions);
    content.data.reactions = norseUtils.forceArray(content.data.reactions);
    content.data.legendaryActions = norseUtils.forceArray(
      content.data.legendaryActions
    );
    content.data.specialAbilities = norseUtils.forceArray(
      content.data.specialAbilities
    );

    var model = {
      content: content,
      app: app,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
