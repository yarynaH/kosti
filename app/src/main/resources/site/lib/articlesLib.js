var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var common = require("/lib/xp/common");

var norseUtils = require("norseUtils");
var userLib = require("userLib");
var contextLib = require("contextLib");
var hashLib = require("hashLib");

exports.createArticle = createArticle;
exports.createImage = createImage;

function createArticle(data) {
  var site = portal.getSiteConfig();
  var articleExist = contextLib.runInDraftAsAdmin(function() {
    return checkIfArticleExist(data.title);
  });
  if (articleExist) {
    return {
      error: true,
      message: "articleExists"
    };
  }
  var blog = contentLib.get({ key: site.blogLocation });
  var user = userLib.getCurrentUser();
  var stream = portal.getMultipartStream("image");
  var image = createImageObj(stream, user);
  return contextLib.runInDraftAsAdmin(function() {
    var result = contentLib.create({
      name: common.sanitize(data.title),
      parentPath: blog._path,
      displayName: data.title,
      contentType: app.name + ":article",
      data: {
        author: user._id,
        body: data.body,
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
  });
}

function checkIfArticleExist(title) {
  var result = contentLib.query({
    query: "displayName = '" + title + "'",
    contentType: app.name + ":article"
  });
  if (result.total > 0) {
    return true;
  }
  return false;
}

function createImage(data) {
  var stream = portal.getMultipartStream("file");
  var user = userLib.getCurrentUser();
  var image = createImageObj(stream, user);
  return norseUtils.getImage(image._id).url;
}

function createImageObj(stream, user) {
  var site = portal.getSiteConfig();
  var path = contentLib.get({ key: site.userImages })._path;
  var date = new Date();
  var image = contextLib.runInDraftAsAdmin(function() {
    return contentLib.createMedia({
      name: hashLib.generateHash(user.displayName + date.toISOString()),
      parentPath: path,
      data: stream
    });
  });
  var publishResult = contentLib.publish({
    keys: [image._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  return image;
}
