var portal = require("/lib/xp/portal"); // Import the portal functions
var thymeleaf = require("/lib/thymeleaf"); // Import the thymeleaf render function
var contentLib = require("/lib/xp/content");
var norseUtils = require("../../lib/norseUtils");

exports.get = function (req) {
  var component = portal.getComponent();
  var content = portal.getContent();
  var config = component.config || [];
  var model = {
    url: norseUtils.getImage(config.image, "width(768)").url,
    fullUrl: norseUtils.getImage(config.image, "(1, 1)", null, null, "100").url,
    caption: config.caption
  };
  var view = resolve("image.html");
  var body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: "text/html"
  };
};
