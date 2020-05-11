var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var contentLib = require("/lib/xp/content");

// Handle GET requests
exports.get = function (req) {
  // Find the current component from request
  var component = portal.getComponent();

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
  if (video && video.VIDEO_FILE) {
    iframe = false;
    var source = portal.attachmentUrl({
      name: video.VIDEO_FILE
    });
  }

  var model = {
    iframe: iframe,
    url: url,
    videoId: videoId,
    source: source
  };

  var body = thymeleaf.render(resolve("video.html"), model);

  return {
    body: body,
    contentType: "text/html"
  };
};
