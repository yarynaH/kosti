var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var votesLib = require(libLocation + "votesLib");
var userLib = require(libLocation + "userLib");
var blogLib = require(libLocation + "blogLib");
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
      var articles = blogLib.getArticlesView(blogLib.getNewArticles(page));
      break;
    case "bookmarks":
      var user = userLib.getCurrentUser();
      var articles = blogLib.getArticlesView(
        blogLib.getArticlesByIds(user.data.bookmarks, page)
      );
      break;
    case "userArticles":
      var articles = blogLib.getArticlesView(
        blogLib.getArticlesByUser(params.userId, page)
      );
      break;
    case "comments":
      var articles = thymeleaf.render(
        resolve("../../site/pages/user/commentsView.html"),
        { comments: commentsLib.getCommentsByUser(params.userId, params.page) }
      );
      break;
    case "hot":
      var articles = blogLib.getArticlesView(blogLib.getHotArticles(page));
      break;
    case "search":
      var articles = blogLib.getSearchArticles(params.query, page).articles;
      break;
    case "notifications":
      var articles = notificationLib.getNotificationsForUser(
        params.userId,
        page,
        null,
        null,
        null,
        true
      );
      break;
    default:
      var articles = "";
      break;
  }
  return {
    body: articles,
    contentType: "text/html"
  };
};
