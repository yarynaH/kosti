var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var mailsLib = require(libLocation + "mailsLib");

exports.get = function(req) {
  var params = req.params;
  var result = false;
  var view = resolve("newsletter.html");
  mailsLib.sendMail("newsletter", false, {});
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req)
    }),
    contentType: "text/html"
  };
};
