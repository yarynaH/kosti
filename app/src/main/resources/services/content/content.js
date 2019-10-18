var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var votesLib = require(libLocation + "votesLib");
var userLib = require(libLocation + "userLib");
var blogLib = require(libLocation + "blogLib");
var helpers = require(libLocation + "helpers");
var notificationLib = require(libLocation + "notificationLib");
var commentsLib = require(libLocation + "commentsLib");
var thymeleaf = require("/lib/thymeleaf");

exports.post = function(req) {
  var params = req.params;
  var result = {};
  switch (params.action) {
    case "addView":
      result = votesLib.addView(params.content, params.id);
      break;
    case "addShare":
      result = votesLib.addShare(params.id, params.user, params.type);
      break;
    default:
      notificationLib.addNotification(params.content, "like");
      result = votesLib.vote(params.content);
      break;
  }
  return {
    body: result,
    contentType: "application/json"
  };
};

exports.get = function(req) {
  var params = req.params;
  if (params.page) {
    var page = parseInt(params.page);
  } else {
    var page = 0;
  }
  switch (params.feedType) {
    case "new":
      var articlesObj = blogLib.getNewArticles(page);
      var articlesView = blogLib.getArticlesView(articlesObj.hits);
      break;
    case "bookmarks":
      var user = userLib.getCurrentUser();
      var articlesObj = blogLib.getArticlesByIds(user.data.bookmarks, page);
      var articlesView = blogLib.getArticlesView(articlesObj.hits);
      break;
    case "userArticles":
      var articlesObj = blogLib.getArticlesByUser(params.userId, page);
      var articlesView = blogLib.getArticlesView(articlesObj.hits);
      break;
    case "comments":
      var articlesObj = commentsLib.getCommentsByUser(
        params.userId,
        params.page
      );
      var articlesView = commentsLib.getCommentsView(articlesObj.hits);
      break;
    case "hot":
      var articlesObj = blogLib.getHotArticles(page, params.date);
      var articlesView = blogLib.getArticlesView(articlesObj.hits);
      break;
    case "search":
      var articlesObj = blogLib.getSearchArticles(params.query, page);
      var articlesView = articlesObj.hits;
      break;
    case "notifications":
      var articlesObj = notificationLib.getNotificationsForUser(
        params.userId,
        page
      );
      var articlesView = articlesObj.hits;
      break;
    default:
      var articlesObj = { total: 0 };
      var articlesView = "";
      break;
  }
  return {
    body: {
      articles: articlesView,
      hideButton: articlesObj.count < 10,
      buttonText: helpers.getRandomString(),
      date: articlesObj.date ? articlesObj.date : null,
      newPage: articlesObj.newPage ? articlesObj.newPage : null
    },
    contentType: "text/html"
  };
};
