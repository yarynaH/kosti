var portal = require("/lib/xp/portal"); // Import the portal functions
var thymeleaf = require("/lib/thymeleaf"); // Import the thymeleaf render function
var contentLib = require("/lib/xp/content");

exports.get = function(req) {
  var component = portal.getComponent();
  var content = portal.getContent();
  var attachment = component.config || [];
  var gifURL = portal.attachmentUrl({
    name: attachment.image
  });
  var model = {
    title: attachment.title,
    gifURL: gifURL
  };
  var view = resolve("gif.html");
  var body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: "text/html"
  };
};
