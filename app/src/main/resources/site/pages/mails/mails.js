var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var sharedLib = require(libLocation + "sharedLib");
var mailsLib = require(libLocation + "mailsLib");

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
  var model = {
    showSendButton: params && params.mode && params.mode === "preview",
    content: content,
    site: portal.getSite(),
  };

  return model;
}

function handleReq(req) {
  if (req && req.params && req.params.action === "sendMail") {
    var content = portal.getContent();
    mailsLib.sendMail("newsletter", null, {
      body: createBody(),
      displayName: content.displayName,
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
