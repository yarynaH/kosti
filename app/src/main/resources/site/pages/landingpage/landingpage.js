var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var mailLib = require("/lib/xp/mail");
var httpClientLib = require("/lib/xp/http-client");
var cache = require("/lib/cache");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var votesLib = require(libLocation + "votesLib");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;
  var user = userLib.getCurrentUser();
  var youtubeCache = cache.newCache({
    size: 500,
    expire: 60 * 60 * 24
  });

  function renderView() {
    var view = resolve("landingpage.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/landing.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();
    var description = portal.getSite().data.description;
    var showDescription = true;
    var schedule = getSchedule(site.slider);
    var video = getVideoViaApi(site.gApiKey);

    var model = {
      content: content,
      url: portal.pageUrl({ path: content._path }),
      app: app,
      shopUrl: portal.pageUrl({ id: site.shopLocation }),
      video: video
        ? "https://www.youtube.com/embed/" + video
        : getVideoUrl(site.video),
      schedule: schedule,
      social: site.social,
      pageComponents: helpers.getPageComponents(req),
      showDescription: showDescription
    };

    return model;

    function getSchedule() {
      var scheduleLocation = contentLib.get({ key: site.scheduleLocation });
      var now = new Date();
      now.setDate(now.getDate() - 1);
      now = now.toISOString();
      var result = contentLib.query({
        query: "data.date > dateTime('" + now + "')",
        start: 0,
        count: 3,
        sort: "data.date ASC",
        contentTypes: [app.name + ":schedule"]
      }).hits;
      for (var i = 0; i < result.length; i++) {
        result[i].image = norseUtils.getImage(
          result[i].data.image,
          "block(301, 109)"
        );
        var itemDate = new Date(result[i].data.date);
        result[i].month = norseUtils.getMonthName(itemDate);
        result[i].day = itemDate.getDate().toFixed();
      }
      return result;
    }

    function getVideoFromCache(key) {
      return youtubeCache.get("key", function() {
        return getVideoViaApi(key);
      });
    }

    function getVideoViaApi(key) {
      var response = JSON.parse(
        httpClientLib.request({
          url:
            "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCETKVT-Uj-gAqdSTd2YNaMg&maxResults=1&order=date&type=video&key=" +
            key,
          method: "GET",
          headers: {
            "X-Custom-Header": "header-value"
          },
          connectionTimeout: 2000000,
          readTimeout: 500000,
          contentType: "application/json"
        }).body
      );
      if (
        response.items &&
        response.items[0] &&
        response.items[0].id &&
        response.items[0].id.videoId
      ) {
        return response.items[0].id.videoId;
      }
      return false;
    }

    function getVideoUrl(url) {
      url = url.split("/");
      url = url[url.length - 1];

      if (url.split("?v=")[1]) {
        return "https://www.youtube.com/embed/" + url.split("?v=")[1];
      } else {
        return "https://www.youtube.com/embed/" + url;
      }
    }
  }
  return renderView();
}
