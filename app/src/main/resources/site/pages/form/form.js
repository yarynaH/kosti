var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var moment = require(libLocation + "moment");
var userLib = require(libLocation + "userLib");
var formLib = require(libLocation + "formLib");

exports.get = handleReq;
exports.post = submitForm;

function submitForm(req) {
  if (formLib.checkUserRegistered()) {
    return getFormSubmittedView();
  }
  var params = req.params;
  var userName = params.userName;
  var userPhone = params.userPhone;
  delete params.userName;
  delete params.userPhone;
  var games = [];
  for (var key in params) {
    var ids = key.split("-");
    games.push({ block: parseInt(ids[0]), game: parseInt(ids[1]) });
  }
  var res = addUserToEvent(userName, userPhone, games);
  if (!res) {
    return getFormSubmittedView(req);
  } else {
    req.error = res;
    return handleReq(req);
  }

  function addUserToEvent(userName, userPhone, games) {
    var user = userLib.getCurrentUser();
    if (user && user._id) {
      var userId = user._id;
    }
    var content = portal.getContent();
    var error = false;
    contentLib.modify({
      key: content._id,
      editor: editor
    });
    contentLib.publish({
      keys: [content._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
    return error;
    function editor(c) {
      for (var j = 0; j < games.length; j++) {
        c.data.eventsBlock = norseUtils.forceArray(c.data.eventsBlock);
        c.data.eventsBlock[games[j].block].events = norseUtils.forceArray(
          c.data.eventsBlock[games[j].block].events
        );
        if (!c.data.eventsBlock[games[j].block].events[games[j].game].users) {
          c.data.eventsBlock[games[j].block].events[games[j].game].users = [];
        }
        c.data.eventsBlock[games[j].block].events[
          games[j].game
        ].users = norseUtils.forceArray(
          c.data.eventsBlock[games[j].block].events[games[j].game].users
        );
        if (
          c.data.eventsBlock[games[j].block].events[games[j].game].users
            .length <
          parseInt(
            c.data.eventsBlock[games[j].block].events[games[j].game].maxSpace
          )
        ) {
          c.data.eventsBlock[games[j].block].events[games[j].game].users.push({
            name: userName,
            phone: userPhone,
            user: userId
          });
        } else {
          error = true;
        }
      }
      return c;
    }
  }
}

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("form.html");
    var user = userLib.getCurrentUser();
    if (user.moderator && req.params.admin) {
      return formAdmin(req, req.params.data);
    }
    if (formLib.checkUserRegistered()) {
      return getFormSubmittedView();
    }
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/forms.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var user = userLib.getCurrentUser();
    var up = req.params;
    var content = portal.getContent();
    var blocks = norseUtils.forceArray(content.data.eventsBlock);
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].events = formLib.prepareEvents(blocks[i].events);
    }

    var model = {
      content: content,
      app: app,
      user: user,
      error: req.error,
      blocks: blocks,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}

function getFormSubmittedView(req) {
  var view = resolve("formSubmit.html");
  var user = userLib.getCurrentUser();
  var body = thymeleaf.render(view, {
    pageComponents: helpers.getPageComponents(req),
    gamesUrl: portal.pageUrl({
      id: user._id,
      params: {
        action: "games"
      }
    })
  });
  return {
    body: body,
    contentType: "text/html"
  };
}

function formAdmin(req, getData) {
  if (getData) {
    var view = resolve("userData.html");
  } else {
    var view = resolve("formAdmin.html");
  }
  var content = portal.getContent();
  var blocks = norseUtils.forceArray(content.data.eventsBlock);
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].events = formLib.prepareEvents(blocks[i].events);
  }
  var model = {
    content: content,
    blocks: blocks,
    pageComponents: helpers.getPageComponents(req)
  };
  var body = thymeleaf.render(view, model);
  return {
    body: body,
    contentType: "text/html"
  };
}

function loginRequired(req) {
  var view = resolve("loginMessage.html");
  var body = thymeleaf.render(view, {
    pageComponents: helpers.getPageComponents(req)
  });
  return {
    body: body,
    contentType: "text/html"
  };
}
