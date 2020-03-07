var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var pdfLib = require(libLocation + "pdfLib");
var cartLib = require(libLocation + "cartLib");

exports.get = function(req) {
  var params = req.params;
  var view = resolve("orders.html");
  switch (params.action) {
    case "ticketPdf":
      var cart = cartLib.getCartByQr(params.id);
      var body = pdfLib.generatePdf({
        template: cart.currentTicketType,
        qrData: params.id,
        type: "ticket",
        name: "ticket",
        friendlyId: cart.currentFriendlyId
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
