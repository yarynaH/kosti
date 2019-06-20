var norseUtils = require("norseUtils");
var thymeleaf = require("/lib/thymeleaf");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var kostiUtils = require("kostiUtils");
var sharedLib = require("sharedLib");
var blogLib = require("blogLib");
var commentsLib = require("commentsLib");

exports.addNotification = addNotification;
exports.markNotificationAsSeen = markNotificationAsSeen;
exports.getNotificationsForUser = getNotificationsForUser;

function markNotificationAsSeen(id) {
  var notificationsRepo = sharedLib.connectRepo("notifications");
  notificationsRepo.modify({
    key: id,
    editor: editor
  });
  function editor(node) {
    node.seen = 1;
    return node;
  }
  return true;
}

function getNotificationsForUser(
  id,
  page,
  pageSize,
  counterOnly,
  unseenOnly,
  messageOnly,
  json
) {
  if (!pageSize) {
    var pageSize = 10;
  }
  if (!page) {
    var page = 0;
  }
  var query = "forUser = '" + id + "'";
  if (unseenOnly) {
    query += " and seen = 0";
  }
  var notificationsRepo = sharedLib.connectRepo("notifications");
  var temp = notificationsRepo.query({
    start: page * pageSize,
    count: pageSize,
    query: query,
    sort: "seen ASC, _ts DESC"
  });
  if (counterOnly) {
    return temp.total;
  }
  var result = [];
  if (temp && temp.total > 0) {
    for (var i = 0; i < temp.hits.length; i++) {
      var notification = notificationsRepo.get(temp.hits[i].id);
      if (notification.seen === 0) {
        markNotificationAsSeen(notification._id);
      }
      result.push(beautifyNotification(notification));
    }
  }
  if (json) {
    return result;
  }
  result = thymeleaf.render(
    resolve("../pages/components/user/notification.html"),
    {
      notifications: result
    }
  );
  if (messageOnly) {
    return result;
  }
  return {
    message: result,
    total: temp.total
  };
}

function beautifyNotification(notification) {
  notification.article = contentLib.get({ key: notification.subjectId });
  notification.subType = "article";
  if (!notification.article) {
    notification.subType = "comment";
    notification.article = commentsLib.getCommentParentArticle(
      notification.subjectId
    );
  }
  notification.article = blogLib.beautifyArticle(notification.article);
  var userLib = require("userLib");
  notification.user = userLib.getUserDataById(notification.fromUser);
  notification.date = kostiUtils.getTimePassedSincePostCreation(
    notification._ts.replace("Z", "")
  );
  return notification;
}

function getNotificationBody(notification) {
  var article = contentLib.get({ key: notification.subjectId });
  var subType = "article";
  if (!article) {
    subType = "comment";
    article = commentsLib.getCommentParentArticle(notification.subjectId);
  }
  article = blogLib.beautifyArticle(article);
  var userLib = require("userLib");
  return thymeleaf.render(
    resolve("../pages/components/user/notification.html"),
    {
      type: notification.type,
      user: userLib.getUserDataById(notification.fromUser),
      article: article,
      subType: subType,
      date: kostiUtils.getTimePassedSincePostCreation(
        notification._ts.replace("Z", "")
      )
    }
  );
}

//types: bookmark, like, comment
//subject: article, comment
function addNotification(subject, type) {
  var userLib = require("userLib");
  var user = userLib.getCurrentUser();
  subject = getSubject(subject);
  var forUser = getSubjectAuthor(subject);
  if (!forUser || !user || !subject) {
    return false;
  }
  if (!checkIfNotificationExists(forUser._id, user._id, subject._id, type)) {
    createNotification(forUser._id, user._id, subject._id, type);
  }
  return true;
}

function getSubject(id) {
  var result = contentLib.get({ key: id });
  if (result) {
    return result;
  }
  var commentsRepo = sharedLib.connectRepo("comments");
  result = commentsRepo.get(id);
  if (result) {
    return result;
  }
  return false;
}

function getSubjectAuthor(subject) {
  if (!subject) {
    return false;
  }
  if (subject.data && subject.data.author) {
    return contentLib.get({ key: subject.data.author });
  }
  if (subject.user) {
    return contentLib.get({ key: subject.user });
  }
  return false;
}

function checkIfNotificationExists(forUser, fromUser, subjectId, type) {
  var notificationsRepo = sharedLib.connectRepo("notifications");
  var temp = notificationsRepo.query({
    start: 0,
    count: -1,
    query:
      "forUser = '" +
      forUser +
      "' and fromUser = '" +
      fromUser +
      "' and subjectId = '" +
      subjectId +
      "' and type = '" +
      type +
      "'"
  });
  if (temp.total > 0) {
    return true;
  }
  return false;
}

function createNotification(forUser, fromUser, subjectId, type) {
  var notificationsRepo = sharedLib.connectRepo("notifications");
  var notification = notificationsRepo.create({
    forUser: forUser,
    fromUser: fromUser,
    subjectId: subjectId,
    type: type,
    seen: 0,
    _permissions: [
      {
        principal: "role:system.authenticated",
        allow: [
          "READ",
          "MODIFY",
          "READ_PERMISSIONS",
          "READ",
          "WRITE_PERMISSIONS"
        ],
        deny: []
      }
    ]
  });
  return true;
}
