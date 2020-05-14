var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var notificationLib = require(libLocation + "notificationLib");

exports.get = function (req) {
  var view = resolve("/site/pages/components/header/notifications.html");
  var user = userLib.getCurrentUser();
  var model = {
    user: user,
    notifications: notificationLib.getNotificationsForUser(
      user._id,
      0,
      3,
      null,
      null,
      true
    )
  };
  return {
    body: {
      html: thymeleaf.render(view, model)
    },
    contentType: "application/json"
  };
};
