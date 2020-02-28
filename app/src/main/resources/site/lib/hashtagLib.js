var contentLib = require("/lib/xp/content");
var common = require("/lib/xp/common");
var portal = require("/lib/xp/portal");

var sharedLib = require("sharedLib");
var norseUtils = require("norseUtils");
var votesLib = require("votesLib");
var contextLib = require("contextLib");
var userLib = require("userLib");

exports.getHashtags = getHashtags;
exports.hotHashtagCheck = hotHashtagCheck;
exports.getHotHashtags = getHotHashtags;
exports.getHashtagName = getHashtagName;
exports.getHashtagIdByName = getHashtagIdByName;
exports.getHashtagList = getHashtagList;

function getHashtagList(q, skipIds) {
  if (!q) var q = "";
  var query =
    "(fulltext('displayName', '" +
    q +
    "', 'AND') OR " +
    "ngram('displayName', '" +
    q +
    "', 'AND'))";
  if (skipIds) {
    skipIds = skipIds.split(",");
    query += " AND not _id in ('" + skipIds.join("','") + "')";
  }
  norseUtils.log(query);
  var temp = contentLib.query({
    query: query,
    start: 0,
    count: 10,
    contentTypes: [app.name + ":hashtag"]
  });
  var result = [];
  var showQuery = true;
  for (var i = 0; i < temp.hits.length; i++) {
    if (q === temp.hits[i].displayName) {
      showQuery = false;
    }
    result.push(temp.hits[i].displayName);
  }
  if (q && showQuery) {
    result.push(q);
  }
  return result;
}

function getHashtags(ids) {
  if (!ids) {
    return false;
  }
  ids = norseUtils.forceArray(ids);
  var hashtags = [];
  for (var i = 0; i < ids.length; i++) {
    var hashtag = beautifyHashtag(ids[i]);
    if (hashtag) hashtags.push(hashtag);
  }
  return hashtags;
}

function hotHashtagCheck(hashId, cartId) {
  var node = votesLib.getNode(hashId);
  if (node === false) {
    node = votesLib.createBlankVote(hashId);
  }
  if (!node.views || node.views.indexOf(cartId) === -1) {
    var votesRepo = votesLib.getVotesRepo();
    votesRepo.modify({
      key: node._id,
      editor: editor
    });
    function editor(node) {
      if (!node.views) {
        node.views = [];
      }
      var temp = norseUtils.forceArray(node.views);
      temp.push(cartId);
      node.views = temp;
      node.viewCount = temp.length;
      node.type = "hashtag";
      return node;
    }
  }
}

function getHotHashtags() {
  var votesRepo = votesLib.getVotesRepo();
  var hits = votesRepo.query({
    start: 0,
    count: 5,
    query: "type = 'hashtag'",
    sort: "viewCount DESC"
  }).hits;
  var result = [];
  for (var i = 0; i < hits.length; i++) {
    var temp = votesRepo.get(hits[i].id);
    if (temp && temp._id) {
      var hashtag = beautifyHashtag(temp.id);
      result.push(hashtag);
    }
  }
  return result;
}

function beautifyHashtag(id) {
  var hashtag = contentLib.get({ key: id });
  if (hashtag) {
    return {
      displayName: hashtag.displayName,
      url: sharedLib.generateNiceServiceUrl("search", { hid: hashtag._id }),
      id: hashtag._id
    };
  }
  return null;
}

function getHashtagName(id) {
  if (!id) return "";
  var temp = contentLib.get({ key: id });
  if (temp && temp.displayName) return "#" + temp.displayName;
  return "";
}

function getHashtagIdByName(name, returnObj, createIfMissing) {
  if (!name) return "";
  var query = "displayName = '" + name + "'";
  var temp = contentLib.query({
    query: query,
    start: 0,
    count: 1,
    contentTypes: [app.name + ":hashtag"]
  });
  var hashtag = temp.hits[0];
  if (!hashtag && createIfMissing) {
    hashtag = createHashtag(name);
  }
  if (hashtag) {
    if (returnObj) {
      hashtag.exists = true;
      return hashtag;
    }
    return hashtag._id;
  }
  return { exists: false, displayName: name };
}

function createHashtag(name) {
  if (!name) return false;
  var site = portal.getSiteConfig();
  var hashtags = contentLib.get({ key: site.hashtagsLocation });
  return contextLib.runAsAdminAsUser(userLib.getCurrentUser(), function() {
    var article = contentLib.create({
      parentPath: hashtags._path,
      displayName: name,
      name: common.sanitize(name),
      contentType: app.name + ":hashtag",
      data: {}
    });
    contentLib.publish({
      keys: [article._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    return article;
  });
}
