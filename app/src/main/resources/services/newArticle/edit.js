var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var spellLib = require(libLocation + "spellsLib");
var articlesLib = require(libLocation + "articlesLib");
var blogLib = require(libLocation + "blogLib");

exports.get = handleGet;

function handleGet(req) {
  var me = this;

  function renderView() {
    var user = userLib.getCurrentUser();
    if (!user) {
      return helpers.getLoginRequest();
    }
    //var view = resolve("articleSubmit.html");
    var view = resolve("newArticleNew.html");
    return {
      body: thymeleaf.render(view, createModel(req)),
      contentType: "text/html"
    };
  }

  function createModel() {
    var user = userLib.getCurrentUser();
    var articleStatus = articlesLib.checkArticleStatus(req.params.id);
    var up = req.params;
    if (!up) {
      up = {};
    }

    return {
      access: articleStatus.exists && (articleStatus.author || user.moderator),
      published: articleStatus.exists && articleStatus.published,
      article: articleStatus.article,
      mainImage: norseUtils.getImage(articleStatus.article.data.image),
      components: prepareComponentsForEdit(articleStatus.article),
      similarArticles: getSimilairArticles(articleStatus.article),
      hashtags: getHashtags(articleStatus.article),
      data: up,
      pageComponents: helpers.getPageComponents(req, null, null, "Новая статья")
    };
  }

  function getSimilairArticles(article) {
    if (!article.data.similarArticles) {
      return [];
    }
    var result = [];
    article.data.similarArticles = norseUtils.forceArray(
      article.data.similarArticles
    );
    for (var i = 0; i < article.data.similarArticles.length; i++) {
      result.push(
        articlesLib.renderSimilarArticle(article.data.similarArticles[i])
      );
    }
    return result;
  }

  function getHashtags(article) {
    if (!article.data.hashtags) {
      return [];
    }
    article.data.hashtags = norseUtils.forceArray(article.data.hashtags);
    var result = [];
    for (var i = 0; i < article.data.hashtags.length; i++) {
      var hashtag = contentLib.get({ key: article.data.hashtags[i] });
      result.push(articlesLib.renderHashtagItem(hashtag));
    }
    return result;
  }

  function prepareComponentsForEdit(article) {
    var result = [];
    for (var i = 0; i < article.page.regions.main.components.length; i++) {
      var component = article.page.regions.main.components[i];
      var id = component.path.split("/");
      id = id[id.length - 1];
      if (component.type === "image") {
        result.push(
          articlesLib.getImageComponent({
            image: norseUtils.getImage(component.image),
            id: id,
            caption: component.caption
          })
        );
      } else if (component.type === "text") {
        result.push(
          articlesLib.getTextComponent({ id: id, text: component.text })
        );
      } else if (component.type === "part") {
        result.push(processPartComponent(component, id));
      }
    }
    return result;
  }

  function processPartComponent(component, id) {
    if (component.descriptor === app.name + ":video") {
      return articlesLib.getVideoComponent({
        url: component.config.VIDEO_URL,
        addWrapper: true,
        id: id
      });
    } else if (component.descriptor === app.name + ":quote") {
      return articlesLib.getQuoteComponent({
        id: id,
        text: component.config.text
      });
    }
  }

  return renderView();
}
