var contentLib = require("/lib/xp/content");

var sharedLib = require("sharedLib");
var norseUtils = require("norseUtils");
var votesLib = require("votesLib");

exports.getHashtags = getHashtags;
exports.hotHashtagCheck = hotHashtagCheck;
exports.getHotHashtags = getHotHashtags;
exports.getHashtagName = getHashtagName;

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
