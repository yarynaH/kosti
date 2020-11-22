const contentLib = require("/lib/xp/content");
const portal = require("/lib/xp/portal");
const thymeleaf = require("/lib/thymeleaf");
const i18nLib = require("/lib/xp/i18n");

const norseUtils = require("norseUtils");
const contextLib = require("contextLib");

exports.fixCR = fixCR;

function fixCR() {
  var res = contentLib.query({
    start: 0,
    count: -1,
    query: "_parentPath = '/content" + getMonsterLocation()._path + "' "
  });
  res.hits.forEach((monster) => {
    var cr = monster.data.challengeRating;
    var intCr = parseInt(cr);
    if (cr && cr.indexOf("/") !== -1) {
      cr = cr.split("/");
      cr = cr[0] / cr[1];
    } else if (cr && !isNaN(intCr)) {
      cr = intCr;
    } else {
      cr = 0;
    }
    return contextLib.runInDraftAsAdmin(function () {
      updateMonsterCr(monster, cr);
    });
  });
}

function getMonsterLocation() {
  var site = portal.getSiteConfig();
  return contentLib.get({ key: site.monstersLocation });
}

function updateMonsterCr(monster, cr) {
  contentLib.modify({
    key: monster._id,
    editor: editor
  });
  contentLib.publish({
    keys: [monster._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  function editor(c) {
    c.data.cr = cr;
    return c;
  }
}
