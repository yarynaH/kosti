var portal = require("/lib/xp/portal"); // Import the portal functions
var thymeleaf = require("/lib/thymeleaf"); // Import the thymeleaf render function
var contentLib = require("/lib/xp/content");

// Handle GET requests
exports.get = function (req) {
  // Find the current component from request
  var component = portal.getComponent();

  // Find a config variable for the component
  var video = component.config || [],
    url = "",
    iframe = true;
  var url = video.VIDEO_URL;
  var videoId = null;
  if (url) {
    if (url.split("?v=")[1]) {
      videoId = "https://www.youtube.com/embed/" + url.split("?v=")[1];
    } else {
      videoId = "https://www.youtube.com/embed/" + url;
    }
  }
  if (
    video &&
    video.VIDEO_FILE &&
    video.VIDEO_SOURCE &&
    video.VIDEO_SOURCE === "upload"
  ) {
    iframe = false;
    var source = portal.attachmentUrl({
      name: video.VIDEO_FILE
    });
  }

  // Define the model
  var model = {
    component: component,
    iframe: iframe,
    url: url,
    videoId: videoId,
    source: source
  };

  // Resolve the view
  var view = resolve("video.html");

  // Render a thymeleaf template
  var body = thymeleaf.render(view, model);

  // Return the result
  return {
    body: body,
    contentType: "text/html"
  };
};
