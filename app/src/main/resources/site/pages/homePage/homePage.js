const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const httpClientLib = require("/lib/http-client");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const blogLib = require(libLocation + "blogLib");
const sharedLib = require(libLocation + "sharedLib");
const storeLib = require(libLocation + "storeLib");
const hashtagLib = require(libLocation + "hashtagLib");
const contextLib = require(libLocation + "contextLib");
const cacheLib = require(libLocation + "cacheLib");
const homepageLib = require(libLocation + "homepageLib");

const cache = cacheLib.api.createGlobalCache({
  name: "blog",
  size: 1000,
  expire: 60 * 60 * 24
});

exports.get = handleReq;

function handleReq(req) {
  let user = userLib.getCurrentUser();
  if (
    user &&
    user.roles &&
    user.roles.moderator &&
    req.params.cache === "clear"
  ) {
    cache.api.clear();
  }

  function renderView() {
    let view = resolve("homePage.html");
    let model = createModel();
    let body = thymeleaf.render(view, model);
    let fileName = portal.assetUrl({ path: "js/homepage.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    let content = portal.getContent();
    let site = portal.getSiteConfig();
    let active = {};
    switch (req.params.feed) {
      case "new":
        active.new = "active";
        break;
      case "podcasts":
        active.podcasts = "active";
        break;
      case "bookmarks":
        active.bookmarks = "active";
        break;
      default:
        active.hot = "active";
        break;
    }

    let model = {
      content: content,
      video: homepageLib.getVideoFromCache(app.config.gApiKey),
      sidebar: blogLib.getSidebar(),
      schedule: homepageLib.getScheduleFromCache(),
      active: active,
      hotDate: new Date().toISOString(),
      loadMoreComponent: helpers.getLoadMore(),
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      slider: getSlider(site.slider)
    };

    return model;

    function getSliderView(slider) {
      return thymeleaf.render(resolve("slider.html"), {
        slider: slider
      });
    }

    function getSlider(articles) {
      let result = [];
      articles = norseUtils.forceArray(articles);
      for (let i = 0; i < articles.length; i++) {
        let temp = contentLib.get({ key: articles[i] });
        result.push(blogLib.beautifyArticle(temp));
      }
      return getSliderView(result);
    }
  }
  return renderView();
}
