var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var common = require("/lib/xp/common");

var norseUtils = require("norseUtils");
var userLib = require("userLib");
var contextLib = require("contextLib");
var hashLib = require("hashLib");
var sharedLib = require("sharedLib");
var blogLib = require("blogLib");
var permissions = require("permissions");

exports.createArticle = createArticle;
exports.createImage = createImage;
exports.insertComponents = insertComponents;
exports.getTextComponent = getTextComponent;
exports.getVideoComponent = getVideoComponent;
exports.renderHashtagSuggestion = renderHashtagSuggestion;
exports.renderHashtagItem = renderHashtagItem;
exports.renderArticlesSuggestion = renderArticlesSuggestion;
exports.renderSimilarArticle = renderSimilarArticle;
exports.getYoutubeVideoId = getYoutubeVideoId;
exports.getQuoteComponent = getQuoteComponent;
exports.getImageComponent = getImageComponent;
exports.editArticle = editArticle;

function editArticle(data) {
  var user = userLib.getCurrentUser();
  return contextLib.runInDraft(function () {
    var article = editArticleObject(data, user);
    if (!article.error) {
      article = insertComponents(article._id, data.components);
    }
    return article;
  });
}

function createArticle(data) {
  var user = userLib.getCurrentUser();
  return contextLib.runInDraftAsAdmin(function () {
    var article = createArticleObject(data.params, user, data.saveAsDraft);
    if (!article.error) {
      article = insertComponents(article._id, data.components);
    }
    return article;
  });
}

function editArticleObject(data, user) {
  var articleData = data.params;
  if (data.updateMainImage == "true") {
    var stream = portal.getMultipartStream("image");
    var image = createImageObj(stream, user);
  }
  var result = contentLib.modify({
    key: data.id,
    editor: function (c) {
      c.displayName = articleData.title;
      c.data = {
        author: c.data.author,
        image: image ? image._id : c.data.image,
        hashtags: articleData.hashtags,
        similarArticles: articleData.similarArticles
      };
      if (data.saveAsDraft) {
        c.workflow = {
          state: "IN_PROGRESS",
          checks: { "Review by user": "PENDING" }
        };
      } else {
        c.workflow = {
          state: "READY",
          checks: { "Review by user": "APPROVED" }
        };
      }
      return c;
    }
  });
  return result;
}

function createArticleObject(data, user, saveAsDraft) {
  var site = portal.getSiteConfig();
  var articleExist = checkIfArticleExist(data.title);
  if (articleExist) {
    return {
      error: true,
      message: "articleExists"
    };
  }
  var blog = contentLib.get({ key: site.blogLocation });
  var stream = portal.getMultipartStream("image");
  var image = createImageObj(stream, user);
  var result = contentLib.create({
    name: common.sanitize(data.title),
    parentPath: blog._path,
    displayName: data.title,
    contentType: app.name + ":article",
    data: {
      author: user._id,
      image: image._id,
      hashtags: data.hashtags,
      similarArticles: data.similarArticles
    },
    workflow: { state: saveAsDraft ? "IN_PROGRESS" : "READY" }
  });
  contentLib.setPermissions({
    key: result._id,
    inheritPermissions: false,
    overwriteChildPermissions: true,
    permissions: permissions.default(user.key)
  });
  return result;
}

function checkIfArticleExist(title) {
  var result = contentLib.query({
    query:
      "displayName = '" +
      title +
      "' or _name = '" +
      common.sanitize(title) +
      "'",
    contentType: app.name + ":article"
  });
  if (result.total > 0) {
    return true;
  }
  return false;
}

function createImage(data) {
  return contextLib.runInDraftAsAdmin(function () {
    var stream = portal.getMultipartStream("file");
    var user = userLib.getCurrentUser();
    var image = createImageObj(stream, user);
    image = norseUtils.getImage(image._id);
    if (data.json) return image;
    return getImageComponent({
      id: data.id,
      image: image,
      caption: data.caption
    });
  });
}

function getImageComponent(data) {
  if (!data) {
    data = {};
  }
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/image.html"),
      {
        id: data.id,
        image: data.image,
        caption: data.caption ? data.caption : ""
      }
    )
  };
}

function renderHashtagSuggestion(hashtags) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/hashtagSuggestion.html"),
      {
        hashtags: hashtags
      }
    )
  };
}

function renderArticlesSuggestion(articles) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/articlesSuggestion.html"),
      {
        articles: articles
      }
    )
  };
}

function renderSimilarArticle(id) {
  var article = blogLib.beautifyArticle(contentLib.get({ key: id }));
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/similarArticle.html"),
      {
        article: article
      }
    )
  };
}

function renderHashtagItem(hashtag) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/hashtagItem.html"),
      {
        hashtag: hashtag
      }
    )
  };
}

function getTextComponent(data) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/text.html"),
      {
        id: data.id,
        text: data.text
      }
    )
  };
}

function getQuoteComponent(data) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/blockquote.html"),
      {
        id: data.id,
        text: data.text ? data.text : ""
      }
    )
  };
}

function getVideoComponent(data) {
  var url = data.url ? data.url : "";
  var videoId = getYoutubeVideoId(url);
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/video.html"),
      {
        id: data.id,
        url: url,
        form: data.form,
        videoId: videoId,
        addWrapper: data.addWrapper ? true : false
      }
    )
  };
}

function createImageObj(stream, user) {
  var site = portal.getSiteConfig();
  var path = contentLib.get({ key: site.userImages })._path;
  var date = new Date();
  var image = contentLib.createMedia({
    name: hashLib.generateHash(user.displayName + date.toISOString()),
    parentPath: path,
    data: stream
  });
  var publishResult = contentLib.publish({
    keys: [image._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  return image;
}

function insertComponents(id, data) {
  let repo = sharedLib.connectRepo("com.enonic.cms.default", "draft");
  return repo.modify({
    key: id,
    editor: function (node) {
      return editor(node, generatePageJson(data));
    }
  });
  function editor(node, json) {
    node.components = json;
    return node;
  }
}

function generatePageJson(data) {
  let componentsJson = [];
  for (let i = 0; i < data.length; i++) {
    let value;
    componentsJson.push({ path: "/main/" + i, type: data[i].type });
    if (data[i].type === "image") {
      componentsJson[i].image = { id: data[i].value, caption: data[i].caption };
    } else if (data[i].type === "text") {
      componentsJson[i].text = { value: data[i].value };
    } else if (data[i].type === "part") {
      componentsJson[i].part = {
        descriptor: app.name + ":" + data[i].descriptor,
        config: { "com-myurchenko-kostirpg": {} }
      };
      componentsJson[i].part.config["com-myurchenko-kostirpg"][
        data[i].descriptor
      ] = data[i].config;
    }
  }
  componentsJson.unshift({
    type: "page",
    path: "/",
    page: {
      descriptor: app.name + ":article",
      customized: true,
      config: {
        "com-myurchenko-kostirpg": {
          article: {}
        }
      }
    }
  });
  return componentsJson;
}

function getYoutubeVideoId(url) {
  if (url.length === 11) {
    return url;
  }
  if (url.indexOf("youtu.be") !== -1) {
    var videoParts = url.split("/");
    var urlPart = videoParts[videoParts.length - 1];
    return urlPart.split("?")[0];
  } else if (url.indexOf("?") !== -1) {
    var videoUrlParts = url.split("?");
    var videoParams = videoUrlParts[1].split("&");
    for (var i = 0; i < videoParams.length; i++) {
      if (videoParams[i].indexOf("v=") !== -1) {
        return videoParams[i].replace("v=", "");
      }
    }
  }
  return null;
}
