var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var sharedLib = require(libLocation + "sharedLib");
var mailsLib = require(libLocation + "mailsLib");
var userLib = require(libLocation + "userLib");

exports.get = handleReq;

function createBody(params) {
  var view = resolve("mails.html");
  var model = createModel(params);
  return portal.processHtml({
    value: thymeleaf.render(view, model),
    type: "absolute",
  });
}

function createModel(params) {
  var content = portal.getContent();
  var user = userLib.getCurrentUser();
  var model = {
    showSendButton: params && params.mode === "live" && user.roles.moderator,
    content: content,
    site: portal.getSite(),
  };

  return model;
}

function handleReq(req) {
  var user = userLib.getCurrentUser();
  if (
    req &&
    req.params &&
    req.params.action === "sendMail" &&
    user.roles.moderator
  ) {
    var content = portal.getContent();
    mailsLib.sendMail("newsletter", null, {
      body: createBody(),
      displayName: content.displayName,
      mailLists: content.data.mailLists,
    });
  }
  function renderView() {
    return {
      body: createBody(req),
      contentType: "text/html",
    };
  }
  return renderView();
}
