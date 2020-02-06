var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var authLib = require("/lib/xp/auth");
var nodeLib = require("/lib/xp/node");
var userLib = require("userLib");
var contentLib = require("/lib/xp/content");
var contextLib = require("contextLib");
var moment = require("moment");

exports.createBlankVote = createBlankVote;
exports.vote = vote;
exports.countUpvotes = countUpvotes;
exports.checkIfVoted = checkIfVoted;
exports.getHotArticleIds = getHotArticleIds;
exports.checkIfVoteExist = checkIfVoteExist;
exports.addView = addView;
exports.countViews = countViews;
exports.getNode = getNode;
exports.getVotesRepo = getVotesRepo;
exports.getWeekArticleId = getWeekArticleId;
exports.addShare = addShare;
exports.countShares = countShares;
exports.fixVotesTimestamps = fixVotesTimestamps;
exports.setVoteDate = setVoteDate;

function vote(content) {
  var user = userLib.getCurrentUser();
  if (!user || !user.key) {
    return false;
  }
  var result = contextLib.runAsAdmin(function() {
    return doVote(user.key, content);
  });

  return result;
}

function addView(content, id) {
  var result = contextLib.runAsAdmin(function() {
    return doAddView(content, id);
  });

  return result;
}

function doAddView(content, id) {
  var node = getNode(content);
  if (node === false) {
    node = createBlankVote(content);
  }
  var votesRepo = getVotesRepo();
  return votesRepo.modify({
    key: node._id,
    editor: editor
  });
  function editor(node) {
    if (!node.views) {
      node.views = [];
    }
    var temp = norseUtils.forceArray(node.views);
    if (temp.indexOf(id) === -1) {
      temp.push(id);
    }
    node.views = temp;
    return node;
  }
}

function countViews(id) {
  var node = getNode(id);
  if (node && node.views) {
    node.views = norseUtils.forceArray(node.views);
    return node.views.length;
  }
  return "0";
}

function countUpvotes(id) {
  var node = getNode(id);
  if (node && node.votes) {
    return norseUtils.forceArray(node.votes).length;
  }
  return "0";
}

function doVote(user, content) {
  var node = getNode(content);
  if (!checkIfVoteExist(user, node) && node && user) {
    return upvote(user, node);
  } else if (checkIfVoteExist(user, node) && node && user) {
    return downvote(user, node);
  } else if (!node && user) {
    return createVote(user, content);
  } else {
    return false;
  }
}

function checkIfVoted(content) {
  var user = userLib.getCurrentUser();
  var node = getNode(content);
  if (user && user.key && content && node) {
    return checkIfVoteExist(user.key, node);
  }
  return false;
}

function checkIfVoteExist(user, node) {
  if (node) {
    node.votes = norseUtils.forceArray(node.votes);
    if (node.votes && node.votes.indexOf(user) != -1) {
      return true;
    }
  }
  return false;
}

function createBlankVote(node, type) {
  if (!type) {
    var type = "article";
  }
  var votesRepo = getVotesRepo();
  return votesRepo.create({
    id: node,
    votes: [],
    rate: 0,
    shares: { vk: [], facebook: [], twitter: [] },
    type: type
  });
}

function createVote(user, content, type) {
  if (!type) {
    var type = "article";
  }
  var votesRepo = getVotesRepo();
  return votesRepo.create({
    id: content,
    votes: [user],
    type: type
  });
}

function upvote(user, node) {
  var votesRepo = getVotesRepo();
  return votesRepo.modify({
    key: node._id,
    editor: editor
  });
  function editor(node) {
    if (!node.votes) {
      node.votes = [];
    }
    var temp = norseUtils.forceArray(node.votes);
    temp.push(user);
    node.votes = temp;
    node.rate = node.votes.length;
    return node;
  }
}

function downvote(user, node) {
  var votesRepo = getVotesRepo();
  return votesRepo.modify({
    key: node._id,
    editor: editor
  });
  function editor(node) {
    node.votes = norseUtils.forceArray(node.votes);
    node.votes.splice(node.votes.indexOf(user), 1);
    node.rate = node.votes.length;
    return node;
  }
}

function getNode(id) {
  var votesRepo = getVotesRepo();
  var result = votesRepo.query({
    start: 0,
    count: 1,
    query: "id = '" + id + "'"
  });
  if (result && result.hits && result.hits[0]) {
    return votesRepo.get(result.hits[0].id);
  }
  return false;
}

function getHotArticleIds(page, date) {
  var pageSize = 10;
  var votesRepo = getVotesRepo();
  var result = { hits: [], total: 0, count: 0 };
  var usePaging = true;
  while (
    pageSize > result.count &&
    date > Date.parse("01 JAN 2019 00:00:00 GMT")
  ) {
    var oldDate = date;
    date = new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000);
    var temp = getHotArticlesQuery(
      usePaging ? page * pageSize + result.count : 0,
      pageSize - result.count,
      date,
      oldDate
    );
    result.total += temp.total;
    result.count += temp.count;
    result.hits = result.hits.concat(temp.hits);
    if (
      pageSize > result.count &&
      date > Date.parse("01 JAN 2019 00:00:00 GMT")
    ) {
      usePaging = false;
    }
  }

  var resArr = [];
  for (var i = 0; i < result.hits.length; i++) {
    var temp = votesRepo.get(result.hits[i].id);
    if (temp && temp._id && temp.id) {
      resArr.push(temp.id);
    }
  }
  result.hits = resArr;
  result.date = date.toISOString();
  result.newPage = !usePaging;
  return result;
}

function getHotArticlesQuery(start, count, date, oldDate) {
  var votesRepo = getVotesRepo();
  return votesRepo.query({
    start: start,
    count: count,
    query:
      "type = 'article' AND date > dateTime('" +
      date.toISOString() +
      "') AND date < dateTime('" +
      oldDate.toISOString() +
      "') ",
    sort: "rate DESC, date DESC"
  });
}

function getVotesRepo() {
  return nodeLib.connect({
    repoId: "votes",
    branch: "master",
    principals: ["role:system.admin"]
  });
}

function getWeekArticleId() {
  var votesRepo = getVotesRepo();
  var date = new Date();
  date = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000);
  date = date.toISOString();
  var result = votesRepo.query({
    start: 0,
    count: 1,
    query: "type = 'article' AND _ts > dateTime('" + date + "')",
    sort: "rate DESC"
  });
  if (result && result.hits && result.hits.length > 0) {
    var article = votesRepo.get(result.hits[0].id);
    if (article && article.id) {
      if (contentLib.get({ key: article.id })) {
        return article.id;
      }
    }
  }
  var site = portal.getSiteConfig();
  return site.weeksPost;
}

function addShare(id, user, type) {
  var node = getNode(id);
  if (node === false) {
    node = createBlankVote(id);
  }
  var votesRepo = getVotesRepo();
  return votesRepo.modify({
    key: node._id,
    editor: editor
  });
  function editor(node) {
    if (!node.shares) {
      node.shares = {};
    }
    if (!node.shares[type]) {
      node.shares[type] = [];
    }
    var temp = norseUtils.forceArray(node.shares[type]);
    if (temp.indexOf(user) === -1) {
      temp.push(user);
    }
    node.shares[type] = temp;
    return node;
  }
}

function countShares(id) {
  var votesRepo = getVotesRepo();
  var queryRes = votesRepo.query({
    start: 0,
    count: 1,
    query: "id = '" + id + "'"
  });
  var result = 0;
  if (queryRes && queryRes.hits && queryRes.hits.length > 0) {
    var article = votesRepo.get(queryRes.hits[0].id);
    if (article.shares) {
      for (var attr in article.shares) {
        var temp = norseUtils.forceArray(article.shares[attr]);
        result += temp.length;
      }
    }
  }
  return result.toFixed();
}

function fixVotesTimestamps() {
  var votesRepo = getVotesRepo();
  var votes = votesRepo.query({
    query: "",
    start: 0,
    count: -1
  });
  var temp = norseUtils.forceArray(votes.hits);
  for (var i = 0; i < temp.length; i++) {
    temp[i] = votesRepo.get(temp[i].id);
    if (!temp[i].id) {
      continue;
    }
    var cont = contentLib.get({ key: temp[i].id });
    if (cont && cont.publish && cont.publish.from) {
      setVoteDate(temp[i]._id, cont.publish.from);
    }
  }
}

function setVoteDate(id, date) {
  var votesRepo = getVotesRepo();
  var result = votesRepo.modify({
    key: id,
    editor: editor
  });
  function editor(node) {
    node.date = new Date(moment(date.replace("Z", "")));
    return node;
  }
}
