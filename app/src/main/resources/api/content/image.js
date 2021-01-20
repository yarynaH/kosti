const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const userLib = require(libLocation + "userLib");
const hashLib = require(libLocation + "hashLib");
const contextLib = require(libLocation + "contextLib");

exports.post = function (req) {
  return {
    body: contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function () {
      return contextLib.runInDraft(function () {
        return createImageObj();
      });
    }),
    contentType: "application/json"
  };
};

function createImageObj() {
  const user = userLib.getCurrentUser();
  const stream = portal.getMultipartStream("image");
  const site = portal.getSiteConfig();
  const path = contentLib.get({ key: site.userImages })._path;
  const date = new Date();
  const image = contentLib.createMedia({
    name: hashLib.generateHash(user.displayName + date.toISOString()),
    parentPath: path,
    data: stream
  });
  const publishResult = contentLib.publish({
    keys: [image._id],
    sourceBranch: "draft",
    targetBranch: "master",
    includeDependencies: false
  });
  image.url = norseUtils.getImage(image._id);
  return image;
}
