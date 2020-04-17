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
var cartLib = require(libLocation + "cartLib");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");
var pdfLib = require(libLocation + "pdfLib");
var formSharedLib = require(libLocation + "formSharedLib");
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
          "<script src='" + commentsScript + "'></script>",
        ],
      },
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
    content.data.bookmarks = norseUtils.forceArray(content.data.bookmarks);
    var userSystemObj = userLib.getSystemUser(content.data.email);
    var currUserFlag = currUser.key == userSystemObj.key;
    content.votes = blogLib.countUserRating(content._id);
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
      comments: commentsLib.getCommentsByUser(content._id, 0, 1, true),
      games: getGames(true),
      orders: cartLib.getCartsByUser(content.data.email, content._id, true),
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
        comments: userComments,
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
    } else if (up.action == "games" && currUserFlag) {
      var games = getGames();
      totalArticles.curr = games.total;
      active.games = "active";
      var currTitle = "games";
      var articles = thymeleaf.render(resolve("gamesView.html"), {
        currUser: currUser,
        currUserFlag: currUserFlag,
        gameMasterForm: thymeleaf.render(resolve("games/gm/gmComp.html"), {
          days: thymeleaf.render(resolve("games/shared/scheduleComp.html"), {
            days: formSharedLib.getDays(),
          }),
        }),
      });
    } else if (up.action == "orders" && currUserFlag) {
      var orders = cartLib.getCartsByUser(content.data.email, content._id);
      totalArticles.curr = orders.total;
      active.orders = "active";
      var currTitle = "orders";
      var articles = thymeleaf.render(resolve("ordersView.html"), {
        orders: orders.hits,
      });
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
        user: content,
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
      createArticleUrl: sharedLib.generateNiceServiceUrl("create"),
      loadMoreComponent: helpers.getLoadMore(
        totalArticles.curr,
        currTitle,
        null,
        true
      ),
      editUserModal: editUserModal,
      articlesView: articles,
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
    };

    function getGames(countOnly) {
      var games = contentLib.query({
        start: 0,
        count: -1,
        query: "fulltext('data.*', '" + content._id + "', 'OR')",
        contentTypes: [app.name + ":form"],
      });
      if (countOnly) {
        return games.total;
      }
      var result = [];
      var count = 0;
      var tempGames = games.hits;
      for (var i = 0; i < tempGames.length; i++) {
        if (!result[i]) {
          result[i] = {
            title: tempGames[i].displayName,
            games: [],
          };
        }
        var blocks = norseUtils.forceArray(tempGames[i].data.eventsBlock);
        for (var j = 0; j < blocks.length; j++) {
          var events = norseUtils.forceArray(blocks[j].events);
          for (var k = 0; k < events.length; k++) {
            if (!events[k].users) continue;
            var users = norseUtils.forceArray(events[k].users);
            for (var n = 0; n < users.length; n++) {
              if (users[n].user === content._id) {
                result[i].games.push({
                  title: events[k].title,
                  time: blocks[j].time
                    ? moment(blocks[j].time).format("D.M.YYYY HH:mm")
                    : null,
                });
                count++;
              }
            }
          }
        }
      }
      games.hits = result;
      games.total = count.toFixed();
      return games;
    }
    return model;
  }

  return renderView();
}
