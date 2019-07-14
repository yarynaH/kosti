var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var votesLib = require(libLocation + "votesLib");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var blogLib = require(libLocation + "blogLib");
var sharedLib = require(libLocation + "sharedLib");
var hashtagLib = require(libLocation + "hashtagLib");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;
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
    var up = req.params;
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();
    var description = portal.getSite().data.description;
    var showDescription = true;
    var schedule = getSchedule(site.slider);
    var video = getVideoViaApi(site.gApiKey);
    var video = "";
    var active = {};
    switch (up.feed) {
      case "new":
        active.new = "active";
        var articlesQuery = blogLib.getNewArticles();
        var articles = articlesQuery.hits;
        break;
      case "bookmarks":
        active.bookmarks = "active";
        var articlesQuery = blogLib.getArticlesByIds(user.data.bookmarks);
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
      url: portal.pageUrl({ path: content._path }),
      video: video
        ? "https://www.youtube.com/embed/" + video
        : getVideoUrl(site.video),
      sidebar: blogLib.getSidebar(),
      schedule: schedule,
      active: active,
      loadMoreComponent: helpers.getLoadMore(articlesQuery.total, null, null),
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      showDescription: showDescription,
      slider: getSlider(site.slider),
      articles: blogLib.getArticlesView(articles)
    };

    return model;

    function getSchedule() {
      var scheduleLocation = contentLib.get({ key: site.scheduleLocation });
      var now = new Date().toISOString();
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
