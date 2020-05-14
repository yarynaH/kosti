var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "../../site/lib/";
var userLib = require(libLocation + "userLib");
var mailsLib = require(libLocation + "mailsLib");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var norseUtils = require(libLocation + "norseUtils");
var notificationLib = require(libLocation + "notificationLib");

var templates = {
  forgotPassForm: "forgotPassForm.html",
  resetFailed: "resetFailed.html",
  unsubscribe: "unsubscribe.html",
  userActivation: "userActivation.html",
  notifications: "../../site/pages/components/header/notifications.html"
};

exports.get = function (req) {
  var params = req.params;
  var model = {};
  var view = false;
  switch (params.action) {
    case "confirmRegister":
      view = resolve(templates.userActivation);
      model.activation = userLib.activateUser(
        decodeURIComponent(params.mail),
        params.hash
      );
      break;
    case "forgotPass":
      view = resolve(templates.forgotPassForm);
      model.email = params.email;
      model.hash = params.hash;
      model.hashMatch = userLib.forgotPass(
        decodeURIComponent(params.email),
        params.hash
      );
      break;
    case "newsletterUnsubscribe":
      mailsLib.unsubscribe(params.hash);
      view = resolve(templates.unsubscribe);
      break;
    default:
      break;
  }
  model.pageComponents = helpers.getPageComponents(req);
  if (!view) {
    return logout();
  }
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };
};

exports.post = function (req) {
  var result = false;
  var params = req.params;
  if (params.action == "addBookmark") {
    notificationLib.addNotification(params.id, "bookmark");
    result = userLib.addBookmark(params.id);
  } else if (params.action == "resetpass") {
    if (userLib.setNewPass(params.password, params.email, params.hash)) {
      return logout();
    } else {
      return {
        body: thymeleaf.render(resolve(templates.resetFailed), {
          pageComponents: helpers.getPageComponents(req)
        }),
        contentType: "text/html"
      };
    }
  }
  return {
    body: result,
    contentType: "application/json"
  };
};

function logout() {
  userLib.logout();
  var site = portal.getSite();
  return {
    redirect: portal.pageUrl({ path: site._path })
  };
}
