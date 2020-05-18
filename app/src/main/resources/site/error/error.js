var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "../lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var sharedLib = require(libLocation + "sharedLib");
var slackLib = require("/lib/slackLib");

var viewGeneric = resolve("error.html");
var view404 = resolve("404.html");
var view401 = resolve("401.html");

exports.handleError = function (err) {
  var siteConfig = portal.getSiteConfig();
  slackLib.sendMessage({
    channel: app.config.slackChannelSystem,
    title: "Error " + err.status,
    body: err.message
  });
  var site = portal.getSite();
  var body = thymeleaf.render(viewGeneric, {
    pageComponents: helpers.getPageComponents(err),
    social: siteConfig.social,
    lang: site.language,
    status: err.status,
    message: err.message,
    homeUrl: sharedLib.generateNiceServiceUrl("")
  });
  return {
    contentType: "text/html",
    body: body
  };
};

exports.handle404 = function (err) {
  var body = thymeleaf.render(view404, {
    pageComponents: helpers.getPageComponents(err),
    homeUrl: sharedLib.generateNiceServiceUrl("")
  });
  return {
    contentType: "text/html",
    body: body
  };
};

exports.handle403 = function (err) {
  var body = thymeleaf.render(view401, {
    pageComponents: helpers.getPageComponents(err),
    homeUrl: sharedLib.generateNiceServiceUrl("")
  });
  return {
    contentType: "text/html",
    body: body
  };
};
