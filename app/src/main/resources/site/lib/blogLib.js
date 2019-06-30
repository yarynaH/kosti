var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");

var norseUtils = require("norseUtils");
var kostiUtils = require("kostiUtils");
var votesLib = require("votesLib");
var userLib = require("userLib");
var moment = require("moment");
var commentsLib = require("commentsLib");
var sharedLib = require("sharedLib");
var i18nLib = require("/lib/xp/i18n");

exports.beautifyArticle = beautifyArticle;
exports.beautifyArticleArray = beautifyArticleArray;
exports.getArticlesView = getArticlesView;
exports.getArticlesByIds = getArticlesByIds;
exports.getNewArticles = getNewArticles;
exports.getHotArticles = getHotArticles;
exports.getArticlesByUser = getArticlesByUser;
exports.getWeeksPost = getWeeksPost;
exports.getSolialLinks = getSolialLinks;
exports.getSidebar = getSidebar;
exports.getSearchArticles = getSearchArticles;
exports.getRandomString = getRandomString;

function beautifyArticleArray(articles) {
  articles = norseUtils.forceArray(articles);
  for (var i = 0; i < articles.length; i++) {
    articles[i] = beautifyArticle(articles[i]);
  }
  return articles;
}

function getSolialLinks() {
  var site = portal.getSiteConfig();
  return thymeleaf.render(
    resolve("../pages/components/blog/socialLinks.html"),
    { social: site.social }
  );
}

function getWeeksPost() {
  var site = portal.getSiteConfig();
  var article = contentLib.get({ key: site.weeksPost });
  article = beautifyArticle(article);
  return thymeleaf.render(resolve("../pages/components/blog/weeksPost.html"), {
    article: article
  });
}

function getLibraryHot() {
  return thymeleaf.render(
    resolve("../pages/components/blog/libraryHot.html"),
    {}
  );
}

function getSidebar() {
  return thymeleaf.render(
    resolve("../pages/components/blog/blogSidebar.html"),
    {
      weeksPost: getWeeksPost(),
      socialLinks: getSolialLinks(),
      libraryHot: getLibraryHot()
    }
  );
}

function beautifyArticle(article) {
  article.image = norseUtils.getImage(article.data.image, "block(767, 350)");
  article.imageMobile = norseUtils.getImage(
    article.data.image,
    "block(767, 350)"
  );
  article.imageDesktop = norseUtils.getImage(
    article.data.image,
    "block(1920, 1080)"
  );
  article.author = contentLib.get({ key: article.data.author });
  if (article.author) {
    article.author.image = norseUtils.getImage(
      article.author.data.userImage,
      "block(60, 60)"
    );
    article.author.url = portal.pageUrl({ id: article.author._id });
  } else {
    article.author = { image: norseUtils.getImage(null, "block(60, 60)", 1) };
  }
  article.url = portal.pageUrl({ id: article._id });
  article.date = kostiUtils.getTimePassedSincePostCreation(
    new Date(moment(article.publish.from.replace("Z", "")))
  );
  article.votes = votesLib.countUpvotes(article._id);
  article.voted = false;
  article.views = votesLib.countViews(article._id);
  article.bookmarked = userLib.checkIfBookmarked(article._id);
  article.commentsCounter = commentsLib.countComments(article._id).toFixed();
  if (parseInt(article.votes) > 0) {
    article.voted = votesLib.checkIfVoted(article._id);
  }
  article.hashtags = getHashtags(article.data.hashtags);
  return article;
}

function getHashtags(ids) {
  if (!ids) {
    return false;
  }
  ids = norseUtils.forceArray(ids);
  var hashtags = [];
  for (var i = 0; i < ids.length; i++) {
    var hashtag = contentLib.get({ key: ids[i] });
    if (!hashtag) {
      continue;
    }
    hashtags.push({
      displayName: hashtag.displayName,
      url: sharedLib.generateNiceServiceUrl("search", { hid: hashtag._id })
    });
  }
  return hashtags;
}

function getArticlesView(articles) {
  articles = norseUtils.forceArray(articles);
  return thymeleaf.render(resolve("../pages/homePage/articleList.html"), {
    articles: articles
  });
}

function getArticlesByIds(ids, page) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  if (ids) {
    var result = [];
    ids = norseUtils.forceArray(ids);
    for (var i = page * pageSize; i < pageSize * (page + 1); i++) {
      if (ids[i]) {
        var temp = contentLib.get({ key: ids[i] });
        if (temp) {
          result.push(temp);
        }
      }
    }
    result = beautifyArticleArray(result);
    return result;
  } else {
    return [];
  }
}

function getNewArticles(page) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  var result = contentLib.query({
    query: "",
    start: page * pageSize,
    count: pageSize,
    sort: "publish.from DESC",
    contentTypes: [app.name + ":article"]
  }).hits;
  result = beautifyArticleArray(result);
  return result;
}

function getSearchArticles(q, page, useHashtag) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  q = q.replaceAll("'", '"');

  if (useHashtag)
    var query = "data.hashtags IN ('" + q + "') OR data.hashtags = '" + q + "'";
  else
    var query =
      "fulltext('displayName^5,data.*,page.*', '" +
      q +
      "', 'AND') OR " +
      "ngram('displayName^5,data.*,page.*', '" +
      q +
      "', 'AND')";
  var articles = [];
  var result = contentLib.query({
    query: query,
    start: page * pageSize,
    count: pageSize,
    contentTypes: [app.name + ":article"]
  });
  if (result && result.hits && result.hits.length > 0) {
    articles = beautifyArticleArray(result.hits);
  }
  return {
    articles: getArticlesView(articles),
    total: result.total
  };
}

function getHotArticles(page) {
  if (!page) {
    page = 0;
  }
  var hotIds = votesLib.getHotIds(page);
  return getArticlesByIds(hotIds);
}

function getArticlesByUser(id, page, count) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  var articles = contentLib.query({
    start: page * pageSize,
    count: pageSize,
    query: "data.author = '" + id + "'"
  });
  if (count) {
    return articles.total;
  }
  articles = articles.hits;
  articles = beautifyArticleArray(articles);
  return articles;
}

function getRandomString() {
  var min = 1;
  var max = 11;
  //maximum not including
  var randomNumber = Math.floor(Math.random() * (max - min)) + min;
  return i18nLib.localize({
    key: "blog.loadMoreText." + randomNumber
  });
}
