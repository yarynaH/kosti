var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var valueLib = require("/lib/xp/value");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var moment = require(libLocation + "moment");
var votesLib = require(libLocation + "votesLib");
var sharedLib = require(libLocation + "sharedLib");
var blogLib = require(libLocation + "blogLib");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");
var commentsLib = require(libLocation + "commentsLib");
var notificationLib = require(libLocation + "notificationLib");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("user.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var commentsScript = portal.assetUrl({ path: "js/comments.js" });
    var userPageScript = portal.assetUrl({ path: "js/userpage.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" + userPageScript + "'></script>",
          "<script src='" + commentsScript + "'></script>"
        ]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    content.image = norseUtils.getImage(
      content.data.userImage,
      "block(140,140)",
      1
    );
    var currUser = userLib.getCurrentUser();
    var userSystemObj = userLib.getSystemUser(content.data.email);
    var currUserFlag = currUser.key == userSystemObj.key;
    content.votes = blogLib.countUserRating();
    var date = new Date(moment(content.publish.from.replace("Z", "")));
    content.date =
      date.getDate() +
      " " +
      norseUtils.getMonthName(date) +
      " " +
      date.getFullYear();
    var totalArticles = {
      articles: blogLib.getArticlesByUser(content._id, 0, true),
      notifications: notificationLib.getNotificationsForUser(
        content._id,
        null,
        null,
        true
      ),
      comments: commentsLib.getCommentsByUser(content._id, 0, 1, true)
    };

    var active = {};
    if (up.action == "bookmarks" && currUserFlag) {
      totalArticles.curr = content.data.bookmarks
        ? content.data.bookmarks.length
        : 0;
      active.bookmarks = "active";
      var currTitle = "bookmarks";
      var articles = blogLib.getArticlesView(
        blogLib.getArticlesByIds(content.data.bookmarks).hits
      );
    } else if (up.action == "comments") {
      totalArticles.curr = totalArticles.comments;
      active.comments = "active";
      var currTitle = "comments";
      var userComments = commentsLib.getCommentsByUser(content._id).hits;
      var articles = thymeleaf.render(resolve("commentsView.html"), {
        comments: userComments
      });
    } else if (up.action == "notifications" && currUserFlag) {
      totalArticles.curr = totalArticles.notifications;
      active.notifications = "active";
      var currTitle = "notifications";
      var notifications = notificationLib.getNotificationsForUser(
        content._id,
        0,
        10
      );
      var articles = notifications.hits;
    } else {
      totalArticles.curr = totalArticles.articles;
      active.articles = "active";
      var currTitle = "articles";
      var articles = blogLib.getArticlesView(
        blogLib.getArticlesByUser(content._id).hits
      );
    }
    var pluralArticlesString = sharedLib.getTranslationCounter(
      totalArticles.curr
    );
    if (currUserFlag) {
      var editUserModal = thymeleaf.render(resolve("userEditModal.html"), {
        user: content
      });
    }

    var model = {
      content: content,
      currUserFlag: currUserFlag,
      currTitle: currTitle,
      pluralArticlesString: pluralArticlesString,
      totalArticles: totalArticles,
      articles: articles,
      active: active,
      loadMoreComponent: helpers.getLoadMore(
        totalArticles.curr,
        currTitle,
        null,
        true
      ),
      editUserModal: editUserModal,
      articlesView: articles,
      pageComponents: helpers.getPageComponents(req, "footerBlog")
    };

    return model;
  }

  return renderView();
}
