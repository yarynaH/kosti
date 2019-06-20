var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var kostiUtils = require("kostiUtils");

exports.addComment = addComment;
exports.getCommentsByParent = getCommentsByParent;
exports.voteForComment = voteForComment;
exports.removeComment = removeComment;
exports.getCommentsByUser = getCommentsByUser;
exports.countComments = countComments;
exports.reportComment = reportComment;
exports.getComment = getComment;
exports.beautifyComment = beautifyComment;
exports.getCommentParentArticle = getCommentParentArticle;

function addComment(parent, body) {
  var commentsRepo = connectCommentsRepo();
  var user = userLib.getCurrentUser();
  if (user) {
    user = user._id;
  } else {
    return false;
  }
  var comment = commentsRepo.create({
    body: body,
    parent: parent,
    user: user,
    _permissions: [
      {
        principal: "role:system.authenticated",
        allow: ["READ", "MODIFY", "READ_PERMISSIONS", "WRITE_PERMISSIONS"],
        deny: []
      },
      {
        principal: "role:system.everyone",
        allow: ["READ"],
        deny: []
      }
    ]
  });
  return beautifyComment(comment, false);
}

function getCommentsByUser(id, page, pageSize, counterOnly) {
  if (!pageSize) {
    var pageSize = 10;
  }
  if (!page) {
    var page = 0;
  }
  var commentsRepo = connectCommentsRepo();
  var temp = commentsRepo.query({
    start: page * pageSize,
    count: pageSize,
    query: "user = '" + id + "'",
    sort: "deleted ASC, rate ASC, _ts DESC"
  });
  if (counterOnly) {
    return temp.total;
  }
  if (temp && temp.hits) {
    temp = temp.hits;
  }
  var result = [];
  for (var i = 0; i < temp.length; i++) {
    var comment = commentsRepo.get(temp[i].id);
    comment = beautifyComment(comment, false);
    result.push(comment);
  }
  return result;
}

function removeComment(id, reason) {
  var user = userLib.getCurrentUser();
  if (!user.moderator) {
    return false;
  }
  var commentsRepo = connectCommentsRepo();
  return commentsRepo.modify({
    key: id,
    editor: editor
  });
  function editor(node) {
    node.deleted = 1;
    node.reason = reason;
    return node;
  }
}

function reportComment(id, reason) {
  var user = userLib.getCurrentUser();
  if (!user) return false;
  var commentsRepo = connectCommentsRepo();
  return commentsRepo.modify({
    key: id,
    editor: editor
  });
  function editor(node) {
    if (!node.report) node.report = [];
    var temp = norseUtils.forceArray(node.report);
    for (var i = 0; i < temp.length; i++) {
      if (temp[i].userId === user.key) return node;
    }
    temp.push({ userId: user.key, reason: reason });
    node.report = temp;
    return node;
  }
}

function voteForComment(id) {
  var commentsRepo = connectCommentsRepo();
  var user = userLib.getCurrentUser();
  var comment = commentsRepo.get(id);
  if (!comment || !comment._id || !user || !user.key) {
    return false;
  }
  if (
    !comment.votes ||
    (comment.votes && comment.votes.indexOf(user.key) == -1)
  ) {
    comment = upvote(user.key, comment._id);
  } else {
    comment = downvote(user.key, comment._id);
  }
  return {
    rate: comment.rate,
    voted: comment.votes && comment.votes.indexOf(user.key) != -1
  };
}

function upvote(user, node) {
  var commentsRepo = connectCommentsRepo();
  return commentsRepo.modify({
    key: node,
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
  var commentsRepo = connectCommentsRepo();
  return commentsRepo.modify({
    key: node,
    editor: editor
  });
  function editor(node) {
    node.votes = norseUtils.forceArray(node.votes);
    node.votes.splice(node.votes.indexOf(user), 1);
    node.rate = node.votes.length;
    return node;
  }
}

function getCommentParentArticle(id) {
  var comment = getComment(id);
  var article = contentLib.get({ key: comment.parent });
  if (article) {
    return article;
  } else {
    return getCommentParentArticle(comment.parent);
  }
}

function getCommentsByParent(id, counter, level) {
  var commentsRepo = connectCommentsRepo();
  var temp = commentsRepo.query({
    start: 0,
    count: -1,
    query: "parent = '" + id + "'",
    sort: "rate ASC, _ts ASC"
  }).hits;
  var result = [];
  for (var i = 0; i < temp.length; i++) {
    var comment = commentsRepo.get(temp[i].id);
    comment = beautifyComment(comment, counter, level);
    result.push(comment);
  }
  return result;
}

function getComment(id) {
  var commentsRepo = connectCommentsRepo();
  return commentsRepo.get(id);
}

function beautifyComment(comment, counter, level) {
  if (level || level === 0) {
    level++;
  }
  if (level === 9) {
    comment.nextLevel = true;
  }
  if (!counter) {
    comment.date = kostiUtils.getTimePassedSincePostCreation(
      comment._ts.replace("Z", "")
    );
    comment.author = userLib.getUserDataById(comment.user);
    comment.voted =
      comment.votes && comment.votes.indexOf(comment.author.key) != -1;
  }
  comment.children = getCommentsByParent(comment._id, counter, level);
  return comment;
}

function connectCommentsRepo() {
  return nodeLib.connect({
    repoId: "comments",
    branch: "master"
  });
}

function countComments(id) {
  var comments = getCommentsByParent(id, true);
  var commentsCounter = comments.length;
  for (var i = 0; i < comments.length; i++)
    commentsCounter += countComments(comments[i]._id);
  return commentsCounter;
}
