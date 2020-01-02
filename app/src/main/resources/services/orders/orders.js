var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var pdfLib = require(libLocation + "pdfLib");

exports.get = function(req) {
  var params = req.params;
  var view = resolve("orders.html");
  switch (params.action) {
    case "ticketPdf":
      var body = pdfLib.generatePdf({
        type: "ticket",
        template: params.ticketType,
        qrData: params.id
      });
      var contentType = "application/pdf";
      break;
    default:
      var body = "";
      var contentType = "";
      break;
  }
  return {
    body: body,
    contentType: contentType
  };
};
