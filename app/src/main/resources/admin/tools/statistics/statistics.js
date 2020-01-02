var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");
var adminLib = require("/lib/xp/admin");

var libLocation = "../../../site/lib/";
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var cartLib = require(libLocation + "cartLib");
var statisticsLib = require(libLocation + "statisticsLib");
var qrLib = require(libLocation + "qrLib");
var hashLib = require(libLocation + "hashLib");
var mailsLib = require(libLocation + "mailsLib");
var sharedLib = require(libLocation + "sharedLib");

exports.get = function(req) {
  var view = resolve("statistics.html");
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req),
      carts: statisticsLib.getCartsByProduct({ status: "paid" })
    }),
    contentType: "text/html"
  };
};
