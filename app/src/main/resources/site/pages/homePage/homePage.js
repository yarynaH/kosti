var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var httpClientLib = require("/lib/http-client");
var cache = require("/lib/cache");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var blogLib = require(libLocation + "blogLib");
var sharedLib = require(libLocation + "sharedLib");
var hashtagLib = require(libLocation + "hashtagLib");

var youtubeCache = cache.newCache({
  size: 1000,
  expire: 60 * 60 * 24
});

exports.get = handleReq;

function handleReq(req) {
  var user = userLib.getCurrentUser();

  function renderView() {
    var view = resolve("homePage.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/homepage.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var content = portal.getContent();
    var site = portal.getSiteConfig();
    var schedule = getSchedule(site.slider);
    var video = getVideoFromCache(app.config.gApiKey);
    var active = {};
    switch (req.params.feed) {
      case "new":
        active.new = "active";
        var articlesQuery = blogLib.getNewArticles();
        var articles = articlesQuery.hits;
        break;
      case "bookmarks":
        active.bookmarks = "active";
        if (user) {
          var articlesQuery = blogLib.getArticlesByIds(user.data.bookmarks);
        } else {
          var articlesQuery = { hits: [], total: 0, count: 0 };
        }
        var articles = articlesQuery.hits;
        break;
      default:
        active.hot = "active";
        var articlesQuery = blogLib.getHotArticles();
        var articles = articlesQuery.hits;
        break;
    }

    var model = {
      content: content,
      video: video
        ? "https://www.youtube.com/embed/" + video
        : getVideoUrl(site.video),
      sidebar: blogLib.getSidebar(),
      schedule: schedule,
      active: active,
      hotDate: articlesQuery.date ? articlesQuery.date : null,
      loadMoreComponent: helpers.getLoadMore(articlesQuery.total, null, null),
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      slider: getSlider(site.slider),
      articles: blogLib.getArticlesView(articles)
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
        result[i].hashtags = hashtagLib.getHashtags(result[i].data.hashtags);
      }
      return result;
    }

    function getSliderView(slider) {
      return thymeleaf.render(resolve("slider.html"), {
        slider: slider
      });
    }

    function getSlider(articles) {
      var result = [];
      articles = norseUtils.forceArray(articles);
      for (var i = 0; i < articles.length; i++) {
        var temp = contentLib.get({ key: articles[i] });
        result[i] = blogLib.beautifyArticle(temp);
      }
      return getSliderView(result);
    }

    function getVideoFromCache(key) {
      return youtubeCache.get("video", function() {
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
