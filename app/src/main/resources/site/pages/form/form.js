var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var moment = require(libLocation + "moment");
var userLib = require(libLocation + "userLib");

exports.get = handleReq;
exports.post = submitForm;

function submitForm(req) {
  if (checkRegisteredUser()) {
    return getFormSubmittedView();
  }
  var params = req.params;
  var userName = params.userName;
  delete params.userName;
  var games = [];
  for (var key in params) {
    var ids = key.split("-");
    games.push({ block: parseInt(ids[0]), game: parseInt(ids[1]) });
  }
  var res = addUserToEvent(userName, games);
  if (!res) {
    return getFormSubmittedView(req);
  } else {
    req.error = res;
    return handleReq(req);
  }

  function addUserToEvent(userName, games) {
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
      targetBranch: "draft",
      includeDependencies: false
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
    if (checkRegisteredUser()) {
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
      //blocks[i].time = moment(blocks[i].time).format("DD.MM.YYYY HH:mm");
      blocks[i].events = prepareEvents(blocks[i].events);
    }

    var model = {
      content: content,
      app: app,
      user: user,
      error: req.error,
      blocks: blocks,
      events: prepareEvents(content.data.events),
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  function prepareEvents(events) {
    if (!events) {
      return [];
    }
    events = norseUtils.forceArray(events);
    for (var i = 0; i < events.length; i++) {
      if (!events[i].users) {
        events[i].users = [];
      }
      events[i].users = norseUtils.forceArray(events[i].users);
      events[i].available =
        parseInt(events[i].maxSpace) > events[i].users.length;
    }
    return events;
  }

  return renderView();
}

function getFormSubmittedView(req) {
  var view = resolve("formSubmit.html");
  var body = thymeleaf.render(view, {
    pageComponents: helpers.getPageComponents(req)
  });
  return {
    body: body,
    contentType: "text/html"
  };
}

function checkRegisteredUser() {
  var user = userLib.getCurrentUser();
  var content = portal.getContent();
  content.data.eventsBlock = norseUtils.forceArray(content.data.eventsBlock);
  for (var j = 0; j < content.data.eventsBlock.length; j++) {
    content.data.eventsBlock[j].events = norseUtils.forceArray(
      content.data.eventsBlock[j].events
    );
    for (var i = 0; i < content.data.eventsBlock[j].events.length; i++) {
      if (content.data.eventsBlock[j].events[i].users) {
        content.data.eventsBlock[j].events[i].users = norseUtils.forceArray(
          content.data.eventsBlock[j].events[i].users
        );
        for (
          var k = 0;
          k < content.data.eventsBlock[j].events[i].users.length;
          k++
        ) {
          if (
            user._id === content.data.eventsBlock[j].events[i].users[k].user
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
