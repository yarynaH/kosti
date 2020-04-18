var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");

exports.get = function (req) {
  var component = portal.getComponent();

  var video = component.config || [],
    url = "",
    iframe = true,
    videoSource = null,
    videoId = null;

  if (video.VIDEO_URL) {
    if (video.VIDEO_URL.indexOf("vimeo.") !== -1) {
      videoSource = "vimeo";
      videoId = video.VIDEO_URL.split("/");
      videoId = videoId[videoId.length - 1];
    } else {
      videoSource = "youtube";
      if (video.VIDEO_URL.indexOf("?") !== -1) {
        var videoUrlParts = video.VIDEO_URL.split("?");
        var videoParams = videoUrlParts[1].split("&");
        for (var i = 0; i < videoParams.length; i++) {
          if (videoParams[i].indexOf("v=") !== -1) {
            videoId = videoParams[i].replace("v=", "");
          }
        }
      }
    }
  }

  if (video && video.VIDEO_URL) {
    if (videoSource == "vimeo") {
      url = "https://player.vimeo.com/video/" + videoId;
    } else if (videoSource == "youtube") {
      url = "https://www.youtube.com/embed/" + videoId;
    }
  }
  if (video && video.VIDEO_FILE) {
    iframe = false;
    var source = portal.attachmentUrl({
      name: video.VIDEO_FILE,
    });
  }

  var model = {
    iframe: iframe,
    url: url,
    source: source,
  };

  var body = thymeleaf.render(resolve("video.html"), model);

  return {
    body: body,
    contentType: "text/html",
  };
};
