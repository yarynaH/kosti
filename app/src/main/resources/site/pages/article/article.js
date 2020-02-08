var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var kostiUtils = require(libLocation + "kostiUtils");
var votesLib = require(libLocation + "votesLib");
var userLib = require(libLocation + "userLib");
var blogLib = require(libLocation + "blogLib");
var commentsLib = require(libLocation + "commentsLib");

exports.get = handleReq;

function handleReq(req) {
  var user = userLib.getCurrentUser();

  function renderView() {
    var view = resolve("article.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/comments.js" });
    // Return the result
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
    var response = [];
    var mainRegion = content.page.regions.main;
    var similarArticles = getSimilar(content.data.similarArticles);
    var comments = commentsLib.getCommentsByParent(content._id, false, 0);
    comments = thymeleaf.render(
      resolve("../components/comments/comments.html"),
      {
        comments: comments,
        articleId: content._id,
        moderator: user.moderator
      }
    );
    if (user) {
      var removeCommentModal = thymeleaf.render(
        resolve("../components/comments/removeCommentModal.html"),
        {}
      );
    }
    content = blogLib.beautifyArticle(content);
    let audio = null;
    if (content.type === app.name + ":podcast" && content.data.audioFile) {
      audio = thymeleaf.render(resolve("../../parts/audio/audio.html"), {
        audioUrl: portal.attachmentUrl({
          name: content.data.audioFile
        })
      });
    }

    var model = {
      content: content,
      audio: audio,
      sidebar: blogLib.getSidebar(),
      mainRegion: mainRegion,
      removeCommentModal: removeCommentModal,
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      similarArticles: similarArticles,
      comments: comments,
      articleFooter: blogLib.getArticleFooter(content)
    };

    return model;
  }

  function getSimilar(ids) {
    if (ids) {
      var result = [];
      ids = norseUtils.forceArray(ids);
      for (var i = 0; i < ids.length; i++) {
        var article = contentLib.get({ key: ids[i] });
        if (article) {
          result.push({
            _id: article._id,
            url: portal.pageUrl({ path: article._path }),
            displayName: article.displayName,
            votes: votesLib.countUpvotes(article._id),
            voted: votesLib.checkIfVoted(article._id)
          });
        }
      }
      return result;
    } else {
      return false;
    }
  }

  return renderView();
}
