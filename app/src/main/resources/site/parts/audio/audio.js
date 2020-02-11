var portal = require("/lib/xp/portal"); // Import the portal functions
var thymeleaf = require("/lib/thymeleaf"); // Import the thymeleaf render function
var contentLib = require("/lib/xp/content");
var norseUtils = require("../../lib/norseUtils");

exports.get = function(req) {
  var component = portal.getComponent();
  var content = portal.getContent();
  var attachment = component.config || [];
  var audioUrl = portal.attachmentUrl({
    name: attachment.image
  });
  var model = {
    title: attachment.title,
    audioUrl: audioUrl,
    preview: req.mode === "edit"
  };
  var view = resolve("audio.html");
  var body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: "text/html"
  };
};
