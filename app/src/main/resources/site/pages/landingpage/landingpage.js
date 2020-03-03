var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var newsletterLib = require(libLocation + "newsletterLib");
var i18nLib = require("/lib/xp/i18n");
var contextLib = require(libLocation + "contextLib");

exports.get = handleReq;
exports.post = handlePost;

function handlePost(req) {
  if (req && req.params && req.params.email) {
    var result = contextLib.runInDraftAsAdmin(function() {
      return newsletterLib.addEmailToNewsletter(req.params.email);
    });
    if (result) {
      return {
        body: {
          text: i18nLib.localize({
            key: "kosticon2020.landing.thanks",
            locale: req.params.lang
          })
        },
        contentType: "application/json"
      };
    }
  }
  return false;
}

function handleReq(req) {
  var me = this;
  var user = userLib.getCurrentUser();

  function renderView() {
    var view = resolve("landingpage.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/landing.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();

    var model = {
      content: content,
      frontPageUrl: portal.pageUrl({ path: portal.getSite()._path }),
      relatedLocales: kostiUtils.getRelatedLocales(content),
      timeRemaining: getRemainingTime("05/21/2020 06:00:00 PM"),
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  function getRemainingTime(date) {
    var days, hours, minutes, seconds;
    date = new Date(date).getTime();
    if (isNaN(date)) {
      return;
    }
    var startDate = new Date();
    startDate = startDate.getTime();
    var timeRemaining = parseInt((date - startDate) / 1000);
    if (timeRemaining >= 0) {
      days = parseInt(timeRemaining / 86400);
      timeRemaining = timeRemaining % 86400;
      hours = parseInt(timeRemaining / 3600);
      timeRemaining = timeRemaining % 3600;
      minutes = parseInt(timeRemaining / 60);
      timeRemaining = timeRemaining % 60;
      seconds = parseInt(timeRemaining);
      return {
        days: parseInt(days, 10).toFixed(),
        hours: ("0" + hours).slice(-2),
        minutes: ("0" + minutes).slice(-2),
        seconds: ("0" + seconds).slice(-2)
      };
    }
  }
  return renderView();
}
