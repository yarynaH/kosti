var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var common = require("/lib/xp/common");

var norseUtils = require("norseUtils");
var userLib = require("userLib");
var contextLib = require("contextLib");
var hashLib = require("hashLib");
var sharedLib = require("sharedLib");

exports.createArticle = createArticle;
exports.createImage = createImage;
exports.insertComponents = insertComponents;
exports.getTextComponent = getTextComponent;
exports.getVideoComponent = getVideoComponent;
exports.checkArticleStatus = checkArticleStatus;

function createArticle(data) {
  var user = userLib.getCurrentUser();
  return contextLib.runInDraftAsAdmin(function() {
    var article = createArticleObject(data.params, user);
    if (!article.error) {
      article = insertComponents(article._id, data.components);
    }
    return article;
  });
}

function createArticleObject(data, user) {
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
      intro: data.intro
    }
  });
  contentLib.setPermissions({
    key: result._id,
    inheritPermissions: false,
    overwriteChildPermissions: true,
    permissions: [
      {
        principal: user.key,
        allow: [
          "READ",
          "CREATE",
          "MODIFY",
          "PUBLISH",
          "READ_PERMISSIONS",
          "WRITE_PERMISSIONS"
        ],
        deny: ["DELETE"]
      },
      {
        principal: "role:system.everyone",
        allow: ["READ"],
        deny: []
      }
    ]
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
  return contextLib.runInDraftAsAdmin(function() {
    var stream = portal.getMultipartStream("file");
    var user = userLib.getCurrentUser();
    var image = createImageObj(stream, user);
    image = norseUtils.getImage(image._id);
    if (data.json) return image;
    return {
      html: thymeleaf.render(
        resolve("../../services/newArticle/components/image.html"),
        {
          id: data.id,
          image: image
        }
      )
    };
  });
}

function getTextComponent(data) {
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/text.html"),
      {
        id: data.id
      }
    )
  };
}

function getVideoComponent(data) {
  var url = data.videoId;
  var videoId = null;
  if (url) {
    if (url.split("?v=")[1]) {
      videoId = "https://www.youtube.com/embed/" + url.split("?v=")[1];
    } else {
      videoId = "https://www.youtube.com/embed/" + url;
    }
  }
  return {
    html: thymeleaf.render(
      resolve("../../services/newArticle/components/video.html"),
      {
        id: data.id,
        form: data.form,
        videoId: videoId
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
    editor: function(node) {
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
      componentsJson[i].config = data[i].config;
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

function checkArticleStatus(id) {
  var user = userLib.getCurrentUser();
  var article = contextLib.runInDraft(function() {
    return contentLib.get({ key: id });
  });
  if (!article) {
    return {
      author: false,
      published: false,
      exists: false
    };
  }
  return {
    author: article.data.author === user._id,
    published: article.publish && article.publish.from ? true : false,
    exists: article ? true : false
  };
}
