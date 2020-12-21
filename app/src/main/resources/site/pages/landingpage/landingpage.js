var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var newsletterLib = require(libLocation + "newsletterLib");
var contextLib = require(libLocation + "contextLib");
var storeLib = require(libLocation + "storeLib");
var sharedLib = require(libLocation + "sharedLib");

exports.get = handleReq;
exports.post = handlePost;

function handlePost(req) {
  if (req && req.params && req.params.email) {
    var result = contextLib.runInDraftAsAdmin(function () {
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
    var jquery = portal.assetUrl({ path: "js/jquery-2.2.0.min.js" });
    var typeText = portal.assetUrl({ path: "js/jquery.animateTyping.js" });
    var fileName = portal.assetUrl({ path: "js/landing.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" + jquery + "'></script>",
          "<script src='" + fileName + "'></script>",
          "<script src='" + typeText + "'></script>"
        ]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    var ticketsSold = storeLib.getSoldTicketsAmount(content.data.products);
    var progress = Math.min(
      ((ticketsSold - parseInt(content.data.prevMilestone)) /
        parseInt(content.data.milestone)) *
        100,
      100
    );
    if (content.data.program) {
      var programUrl = portal.attachmentUrl({
        name: content.data.program
      });
    } else {
      var programUrl = null;
    }

    var model = {
      content: content,
      faqArray: norseUtils.forceArray(content.data.faq),
      progress: progress.toFixed(),
      programUrl: programUrl,
      footerLinks: getFooterLinks(content),
      frontPageUrl: portal.pageUrl({ path: portal.getSite()._path }),
      ticketsUrl: sharedLib.getShopUrl({ type: "ticket" }),
      relatedLocales: kostiUtils.getRelatedLocales(content),
      timeRemaining: getRemainingTime("05/21/2020 06:00:00 PM"),
      pageComponents: helpers.getPageComponents(req, "empty")
    };

    return model;
  }

  function getFooterLinks(content) {
    var result = [];
    if (content.data.footer) {
      content.data.footer = norseUtils.forceArray(content.data.footer);
      for (var i = 0; i < content.data.footer.length; i++) {
        result.push({
          url: portal.pageUrl({ id: content.data.footer[i] }),
          displayName: contentLib.get({ key: content.data.footer[i] })
            .displayName
        });
      }
    }
    return result;
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
