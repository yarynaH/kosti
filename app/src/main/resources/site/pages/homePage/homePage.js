var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var httpClientLib = require("/lib/http-client");
var cacheLib = require("/lib/cache");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var blogLib = require(libLocation + "blogLib");
var sharedLib = require(libLocation + "sharedLib");
var storeLib = require(libLocation + "storeLib");
var hashtagLib = require(libLocation + "hashtagLib");

var cache = cacheLib.newCache({
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
    var schedule = getSchedule();
    var video = getVideo(app.config.gApiKey);
    var active = {};
    switch (req.params.feed) {
      case "new":
        active.new = "active";
        var articlesQuery = blogLib.getNewArticles();
        var articles = articlesQuery.hits;
        break;
      case "podcasts":
        active.podcasts = "active";
        var articlesQuery = blogLib.getNewArticles(null, true);
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
      sidebar: blogLib.getSidebar({ cache: cache }),
      schedule: schedule,
      active: active,
      articlesQuery: articlesQuery,
      hotDate: articlesQuery.date ? articlesQuery.date : null,
      loadMoreComponent: helpers.getLoadMore({
        articlesCount: articlesQuery.total,
        pageSize: articlesQuery.pageSize
      }),
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      slider: getSlider(site.slider),
      articles: blogLib.getArticlesView(articles)
    };

    return model;

    function getSchedule() {
      return cache.get("schedule", function () {
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
          result[i] = beautifySchedule(result[i]);
        }
        var resCopy = JSON.parse(JSON.stringify(result));
        while (result.length < 3) {
          for (var i = 0; i < resCopy.length; i++) {
            if (result.length >= 3) {
              break;
            }
            if (resCopy[i].data.repeat) {
              var temp = JSON.parse(JSON.stringify(resCopy[i]));
              var itemDate = new Date(temp.data.date);
              itemDate.setDate(
                itemDate.getDate() + 7 * parseInt(temp.data.repeat)
              );
              temp.data.date = itemDate;
              result.push(beautifySchedule(temp));
            }
          }
        }
        return result;
      });
    }

    function beautifySchedule(item) {
      item.image = norseUtils.getImage(item.data.image, "block(301, 109)");
      var itemDate = new Date(item.data.date);
      item.month = norseUtils.getMonthName(itemDate);
      item.day = itemDate.getDate().toFixed();
      item.hashtags = hashtagLib.getHashtags(item.data.hashtags);
      item.time = norseUtils.getTime(itemDate);
      if (item.repeat) {
        repeatedItems = true;
      }
      return item;
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
        result[i] = blogLib.beautifyArticle(temp, cache);
      }
      return getSliderView(result);
    }

    function getVideo(key) {
      return cache.get("video", function () {
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
      });
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
