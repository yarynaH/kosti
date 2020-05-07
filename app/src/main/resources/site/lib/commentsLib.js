var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var thymeleaf = require("/lib/thymeleaf");
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
exports.getCommentsView = getCommentsView;

function addComment(parent, body, articleId) {
  var commentsRepo = connectCommentsRepo();
  var user = userLib.getCurrentUser();
  if (user) {
    user = user._id;
  } else {
    return false;
  }
  var comment = commentsRepo.create({
    body: processBody(body),
    parent: parent,
    user: user,
    articleId: articleId,
    createdDate: new Date(),
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
    sort: "rate DESC, createdDate DESC, deleted ASC"
  });
  if (counterOnly) {
    return temp.total;
  }
  var result = [];
  for (var i = 0; i < temp.hits.length; i++) {
    var comment = commentsRepo.get(temp.hits[i].id);
    comment = beautifyComment(comment, false);
    result.push(comment);
  }
  return {
    hits: result,
    total: temp.total,
    count: temp.count
  };
}

function getCommentsView(comments) {
  return thymeleaf.render(resolve("../pages/user/commentsView.html"), {
    comments: comments
  });
}

function removeComment(id, reason) {
  var user = userLib.getCurrentUser();
  if (!user.roles.moderator) {
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
    (comment.votes && comment.votes.indexOf(user.key) === -1)
  ) {
    comment = upvote(user.key, comment._id);
  } else {
    comment = downvote(user.key, comment._id);
  }
  return {
    rate: comment.rate,
    voted: comment.votes && comment.votes.indexOf(user.key) !== -1
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
    if (!node.createdDate) {
      node.createdDate = node._ts;
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
    if (!node.createdDate) {
      node.createdDate = node._ts;
    }
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
    sort: "rate DESC, createdDate ASC"
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
  var user = userLib.getCurrentUser();
  if (level || level === 0) {
    level++;
  }
  if (level === 10) {
    comment.nextLevel = true;
  }
  if (!counter) {
    if (comment.createdDate) {
      var date = comment.createdDate;
    } else {
      var date = comment._ts;
    }
    comment.date = kostiUtils.getTimePassedSincePostCreation(
      date.replace("Z", "")
    );
    comment.author = userLib.getUserDataById(comment.user);
    comment.voted = comment.votes && comment.votes.indexOf(user.key) !== -1;
    if (comment.articleId) {
      comment.url =
        portalLib.pageUrl({ id: comment.articleId }) + "#" + comment._id;
      comment.articleTitle = contentLib.get({
        key: comment.articleId
      }).displayName;
    }
  }
  comment.children = getCommentsByParent(comment._id, counter, level);
  return comment;
}

function processBody(body) {
  body = body.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  body = body.replace(/__([^*]+)__/g, "<u>$1</u>");
  body = body.replace(/\/\/([^*]+)\/\//g, "<i>$1</i>");
  body = body.replace(/~~([^*]+)~~/g, "<s>$1</s>");
  body = body.replace(/```([^*]+)```/g, "<q>$1</q>");
  body = body.replace(/\|\|([^*]+)\|\|/g, "<spoiler>$1</spoiler>");
  body = body.replace(/\r\n/g, "<br />");
  body = createTextLinks(body);
  return body;
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

function createTextLinks(text) {
  return (text || "").replace(
    /([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
    function (match, space, url) {
      return space + '<a href="' + url + '">' + url + "</a>";
    }
  );
}
