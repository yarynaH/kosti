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
var contextLib = require(libLocation + "contextLib");
var sharedLib = require(libLocation + "sharedLib");
var statusPage = require("status");

exports.get = handleGet;

function handleGet(req) {
  var me = this;

  function renderView() {
    var user = userLib.getCurrentUser();
    if (!user) {
      return helpers.getLoginRequest();
    }
    if (!isArticleValid(req.params.id)) {
      return statusPage.get(req);
    }
    var model = createModel(req);
    var view = resolve("newArticleNew.html");
    return {
      body: thymeleaf.render(view, model),
      contentType: "text/html"
    };
  }

  function isArticleValid(id) {
    var status = blogLib.getArticleStatus(req.params.id);
    var user = userLib.getCurrentUser();
    if (!status.exists) {
      return false;
    }
    if (status.published) {
      return false;
    }
    if (!(status.exists && (status.author || user.moderator))) {
      return false;
    }
    return true;
  }

  function createModel() {
    var user = userLib.getCurrentUser();
    var articleStatus = blogLib.getArticleStatus(req.params.id);
    var site = portal.getSiteConfig();
    var article = contextLib.runInDraft(function () {
      return contentLib.get({ key: req.params.id });
    });
    var repo = sharedLib.connectRepo("com.enonic.cms.default", "draft");
    var articleRaw = repo.get(article._id);

    return {
      article: article,
      mainImage: norseUtils.getImage(article.data.image),
      components: prepareComponentsForEdit(articleRaw),
      similarArticles: getSimilairArticles(article),
      hashtags: getHashtags(article),
      site: site,
      agreementPage: portal.pageUrl({
        id: portal.getSiteConfig().agreementPage
      }),
      sidebar: blogLib.getSidebar({ hideNewArticleButton: true }),
      social: site.social,
      date: kostiUtils.getTimePassedSincePostCreation(new Date()),
      pageComponents: helpers.getPageComponents(
        req,
        null,
        null,
        article.displayName
      )
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
    if (article && article.components) {
      article.components = norseUtils.forceArray(article.components);
    } else {
      article.components = [];
    }
    for (var i = 1; i < article.components.length; i++) {
      var component = article.components[i];
      var id = component.path.split("/");
      id = id[id.length - 1];
      if (component.type === "image") {
        result.push(
          articlesLib.getImageComponent({
            image: norseUtils.getImage(component.image.id),
            id: id,
            caption: component.image.caption
          })
        );
      } else if (component.type === "text") {
        result.push(
          articlesLib.getTextComponent({ id: id, text: component.text.value })
        );
      } else if (component.type === "part") {
        result.push(processPartComponent(component.part, id));
      }
    }
    return result;
  }

  function processPartComponent(component, id) {
    if (component.descriptor === app.name + ":video") {
      return articlesLib.getVideoComponent({
        url: component.config["com-myurchenko-kostirpg"].video.VIDEO_URL,
        addWrapper: true,
        id: id
      });
    } else if (component.descriptor === app.name + ":quote") {
      return articlesLib.getQuoteComponent({
        id: id,
        text: component.config["com-myurchenko-kostirpg"].quote.text
      });
    } else if (component.descriptor === app.name + ":image") {
      return articlesLib.getImageComponent({
        id: id,
        image: norseUtils.getImage(
          component.config["com-myurchenko-kostirpg"].image.image,
          "width(768)"
        ),
        caption: component.config["com-myurchenko-kostirpg"].image.caption
      });
    }
  }

  return renderView();
}
