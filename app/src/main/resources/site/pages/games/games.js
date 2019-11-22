var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var moment = require(libLocation + "moment");
var userLib = require(libLocation + "userLib");
var formLib = require(libLocation + "formLib");

exports.get = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("games.html");
    var user = userLib.getCurrentUser();
    var model = createModel();
    var body = thymeleaf.render(view, model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var user = userLib.getCurrentUser();
    var content = portal.getContent();

    var model = {
      content: content,
      user: user,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
