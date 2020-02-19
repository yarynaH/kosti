var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var qrLib = require(libLocation + "qrLib");

exports.get = function(req) {
  var qr = qrLib(4, "L");
  qr.addData("KOSTICON2020");
  qr.make();
  var html = thymeleaf.render(
    resolve("kitchenSink.html"),
    {
      qrcode: qr.createTableTag(15, 0)
    }
    // resolve("../../site/pages/pdfs/regularTicket.html"),
    // {
    //   qrcode: qr.createTableTag(7, 0)
    // }
  );
  if (req.params.pdf) {
    var bean = __.newBean("com.myurchenko.lib.pdf.PdfHandler");
    return {
      body: bean.exportHtml(html),
      contentType: "application/pdf"
    };
  }
  return {
    body: html,
    contentType: "text/html"
  };
};
