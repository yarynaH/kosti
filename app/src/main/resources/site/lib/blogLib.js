var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var i18nLib = require("/lib/xp/i18n");

var norseUtils = require("norseUtils");
var kostiUtils = require("kostiUtils");
var votesLib = require("votesLib");
var userLib = require("userLib");
var moment = require("moment");
var commentsLib = require("commentsLib");
var hashtagLib = require("hashtagLib");
var sharedLib = require("sharedLib");
var contextLib = require("contextLib");

exports.beautifyArticle = beautifyArticle;
exports.beautifyArticleArray = beautifyArticleArray;
exports.getArticlesView = getArticlesView;
exports.getArticlesByIds = getArticlesByIds;
exports.getNewArticles = getNewArticles;
exports.getHotArticles = getHotArticles;
exports.getArticlesByUser = getArticlesByUser;
exports.getSolialLinks = getSolialLinks;
exports.getSidebar = getSidebar;
exports.getSearchArticles = getSearchArticles;
exports.getArticleFooter = getArticleFooter;
exports.countUserRating = countUserRating;
exports.updateSchedule = updateSchedule;
exports.getArticleStatus = getArticleStatus;

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

function getWeekArticle() {
  var weekArticleId = votesLib.getWeekArticleId();
  var article = contentLib.get({ key: weekArticleId });
  if (!article) {
    return "";
  }
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

function getHotTags() {
  return thymeleaf.render(resolve("../pages/components/blog/hotTags.html"), {
    tags: hashtagLib.getHotHashtags()
  });
}

function getSidebar(params) {
  if (!params) {
    params = {};
  }
  return thymeleaf.render(
    resolve("../pages/components/blog/blogSidebar.html"),
    {
      weeksPost: getWeekArticle(),
      socialLinks: getSolialLinks(),
      libraryHot: getLibraryHot(),
      hotTags: getHotTags(),
      hideNewArticleButton: params.hideNewArticleButton,
      createArticleUrl: sharedLib.generateNiceServiceUrl("create")
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
    "block(1905, 560)"
  );
  article.imageSlider = norseUtils.getImage(
    article.data.image,
    "block(1920, 1080)"
  );
  if (article.data.author) {
    article.author = contentLib.get({ key: article.data.author });
  }
  if (article.author) {
    article.author.image = norseUtils.getImage(
      article.author.data.userImage,
      "block(60, 60)",
      1
    );
    article.author.url = portal.pageUrl({ id: article.author._id });
  } else {
    article.author = userLib.getUserDataById(null);
  }
  article.url = portal.pageUrl({ id: article._id });
  article.urlAbsolute = portal.pageUrl({ id: article._id, type: "absolute" });
  if (!article.publish) {
    article.publish = {};
  }
  if (!article.publish.from) {
    var date = new Date();
    article.publish.from = date.toISOString();
  }
  article.date = kostiUtils.getTimePassedSincePostCreation(
    new Date(moment(article.publish.from.replace("Z", "")))
  );
  article.votes = votesLib.countUpvotes(article._id);
  article.voted = false;
  article.views = votesLib.countViews(article._id);
  article.bookmarked = userLib.checkIfBookmarked(article._id);
  article.commentsCounter = commentsLib.countComments(article._id).toFixed();
  article.shares = votesLib.countShares(article._id);
  if (parseInt(article.votes) > 0) {
    article.voted = votesLib.checkIfVoted(article._id);
  }
  article.hashtags = hashtagLib.getHashtags(article.data.hashtags);
  article.status = getArticleStatus(article._id);
  return article;
}

function getArticleStatus(id) {
  var user = userLib.getCurrentUser();
  var article = contextLib.runInDraft(function () {
    return contentLib.get({ key: id });
  });
  if (!article) {
    return {
      exists: false
    };
  }
  return {
    author: article.data.author === user._id,
    published:
      article.workflow.state === "READY" &&
      article.publish &&
      article.publish.from &&
      contentLib.get({ key: id })
        ? true
        : false,
    draft:
      article.workflow.state === "IN_PROGRESS" && !contentLib.get({ key: id }),
    access: article && (article.data.author === user._id || user.moderator),
    exists: article ? true : false
  };
}

function getArticlesView(articles) {
  articles = norseUtils.forceArray(articles);
  for (var i = 0; i < articles.length; i++) {
    articles[i].footer = getArticleFooter(articles[i]);
  }
  return thymeleaf.render(
    resolve("../pages/components/blog/articleList.html"),
    {
      articles: articles
    }
  );
}

function getArticlesByIds(ids, page) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  var count = 0;
  if (ids) {
    var result = [];
    ids = norseUtils.forceArray(ids);
    for (var i = page * pageSize; i < pageSize * (page + 1); i++) {
      if (ids[i]) {
        var temp = contentLib.get({ key: ids[i] });
        if (temp) {
          result.push(temp);
          count++;
        }
      }
    }
    result = beautifyArticleArray(result);
    return {
      hits: result,
      total: ids.length,
      count: count
    };
  } else {
    return {
      hits: [],
      total: 0,
      count: 0
    };
  }
}

function getNewArticles(page, podcast) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  if (!podcast) {
    var contentTypes = [app.name + ":article"];
  } else {
    var contentTypes = [app.name + ":podcast"];
  }
  var result = contentLib.query({
    query: "",
    start: page * pageSize,
    count: pageSize,
    sort: "publish.from DESC",
    contentTypes: contentTypes
  });
  result.hits = beautifyArticleArray(result.hits);
  return result;
}

function getSearchArticles(q, page, useHashtag, json, skipIds) {
  var pageSize = 10;
  if (!page) {
    page = 0;
  }
  q = q.replaceAll("'", '"');

  if (useHashtag)
    var query =
      "(data.hashtags IN ('" + q + "') OR data.hashtags = '" + q + "')";
  else {
    if (q.charAt(0) == "#") q = q.substring(1);
    var hid = hashtagLib.getHashtagIdByName(q);
    var query =
      "(fulltext('displayName^5,data.*,page.*', '" +
      q +
      "', 'AND') OR " +
      "ngram('displayName^5,data.*,page.*', '" +
      q +
      "', 'AND') OR " +
      "data.hashtags IN ('" +
      hid +
      "') OR data.hashtags = '" +
      hid +
      "')";
  }
  if (skipIds) {
    skipIds = skipIds.split(",");
    query += " AND not _id in ('" + skipIds.join("','") + "')";
  }
  var articles = [];
  var result = contentLib.query({
    query: query,
    start: page * pageSize,
    count: pageSize,
    sort: "publish.from DESC",
    contentTypes: [app.name + ":article", app.name + ":podcast"]
  });
  if (json) {
    return result;
  }
  if (result && result.hits && result.hits.length > 0) {
    articles = beautifyArticleArray(result.hits);
  }
  result.hits = getArticlesView(articles);
  return result;
}

function getHotArticles(start, date) {
  if (!start) {
    start = 0;
  }
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  var hotIds = votesLib.getHotArticleIds(start, date);
  var temp = getArticlesByIds(hotIds.hits);
  hotIds.hits = temp.hits;
  return hotIds;
}

//function getArticlesByUser(id, page, count, pageSize) {
function getArticlesByUser(params) {
  if (!params.pageSize) params.pageSize = 10;
  if (!params.page) params.page = 0;
  if (params.runInDraft) {
    var articles = contextLib.runInDraft(function () {
      return contentLib.query({
        start: params.page * params.pageSize,
        count: params.pageSize,
        query: "data.author = '" + params.id + "'",
        contentTypes: [app.name + ":article", app.name + ":podcast"]
      });
    });
  } else {
    var articles = contentLib.query({
      start: params.page * params.pageSize,
      count: params.pageSize,
      query: "data.author = '" + params.id + "'",
      contentTypes: [app.name + ":article", app.name + ":podcast"]
    });
  }
  if (params.count) {
    return articles.total;
  }
  articles.hits = beautifyArticleArray(articles.hits);
  return articles;
}

function getArticleFooter(article) {
  return thymeleaf.render(resolve("../pages/article/articleFooter.html"), {
    article: article,
    bookmarked: userLib.checkIfBookmarked(article._id)
  });
}

function countUserRating(id) {
  var articles = getArticlesByUser({
    id: id,
    page: 0,
    count: false,
    pageSize: -1
  }).hits;
  var articleVotes = 0;
  for (var i = 0; i < articles.length; i++) {
    var votes = votesLib.countUpvotes(articles[i]._id);
    articleVotes += parseInt(votes);
  }
  articleVotes *= 2;
  var comments = commentsLib.getCommentsByUser(id, 0, -1).hits;
  var commentVotes = 0;
  for (var i = 0; i < comments.length; i++) {
    if (comments[i].rate) commentVotes += comments[i].rate;
  }
  return (commentVotes + articleVotes).toFixed();
}

function updateSchedule() {
  norseUtils.log("Started updating schedule.");
  contextLib.runAsAdmin(function () {
    var currDate = new Date();
    var schedules = contentLib.query({
      start: 0,
      count: 5,
      query: "data.date < dateTime('" + currDate.toISOString() + "')",
      filters: {
        boolean: {
          must: [
            {
              exists: {
                field: "data.repeat"
              }
            }
          ]
        }
      }
    });
    for (var i = 0; i < schedules.hits.length; i++) {
      norseUtils.log("Updating " + schedules.hits[i]._id);
      contentLib.modify({
        key: schedules.hits[i]._id,
        editor: editor
      });
      contentLib.publish({
        keys: [schedules.hits[i]._id],
        sourceBranch: "master",
        targetBranch: "draft",
        includeDependencies: false
      });
      function editor(c) {
        var tempDate = moment(c.data.date).toDate();
        tempDate.setDate(tempDate.getDate() + 7 * parseInt(c.data.repeat));
        tempDate = tempDate.toISOString();
        c.data.date = tempDate;
        return c;
      }
    }
  });
  norseUtils.log("Finished updating schedule.");
}
