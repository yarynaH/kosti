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
  var params = req.params;
  var userName = params.userName;
  delete params.userName;
  var games = [];
  for (var key in params) {
    games.push(parseInt(key));
  }
  var result = addUserToEvent(userName, games);
  return getFormSubmittedView(req);

  function addUserToEvent(userName, games) {
    var user = userLib.getCurrentUser();
    if (user && user._id) {
      var userId = user._id;
    }
    var content = portal.getContent();
    contentLib.modify({
      key: content._id,
      editor: editor
    });
    function editor(c) {
      for (var j = 0; j < games.length; j++) {
        if (c.data.events[games[j]].users === null) {
          c.data.events[games[j]].users = {};
        }
        c.data.events[games[j]].users = norseUtils.forceArray(
          c.data.events[games[j]].users
        );
        if (
          c.data.events[games[j]].users.length <
          parseInt(c.data.events[games[j]].maxSpace)
        ) {
          c.data.events[games[j]].users.push({ name: userName, user: userId });
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
      //return getFormSubmittedView();
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

    var model = {
      content: content,
      app: app,
      user: user,
      events: prepareEvents(content.data.events),
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  function checkRegisteredUser() {
    var user = userLib.getCurrentUser();
    var content = portal.getContent();
    content.data.events = norseUtils.forceArray(content.data.events);
    for (var i = 0; i < content.data.events.length; i++) {
      if (content.data.events[i].users) {
        content.data.events[i].users = norseUtils.forceArray(
          content.data.events[i].users
        );
        for (var j = 0; j < content.data.events[i].users.length; j++) {
          if (user._id === content.data.events[i].users[j].user) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function prepareEvents(events) {
    events = norseUtils.forceArray(events);
    for (var i = 0; i < events.length; i++) {
      events[i].time = moment(events[i].time).format("DD.MM.YYYY HH:mm");
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
