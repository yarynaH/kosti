var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");

var libLocation = "../../site/lib/";
var contextLib = require(libLocation + "contextLib");
var helpers = require(libLocation + "helpers");
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var cartLib = require(libLocation + "cartLib");
var qrLib = require(libLocation + "qrLib");
var hashLib = require(libLocation + "hashLib");
var mailsLib = require(libLocation + "mailsLib");

exports.get = function(req) {
  var params = req.params;
  var view = resolve("orders.html");
  switch (params.action) {
    case "addItem":
      cartLib.modify(
        params.id,
        params.itemID,
        params.amount,
        params.size,
        true
      );
      break;
    case "regenerateIds":
      cartLib.generateItemsIds(params.id);
      break;
    case "resendConfirmationMail":
      var cart = cartLib.getCart(params.id);
      mailsLib.sendMail("orderCreated", cart.email, {
        cart: cart
      });
      break;
    case "details":
      break;
    case "readQr":
      view = resolve("readQr.html");
      return {
        body: thymeleaf.render(view, {
          pageComponents: helpers.getPageComponents(req)
        }),
        contentType: "text/html"
      };
      break;
    case "emails":
      var carts = cartLib.getCreatedCarts();
      var result = [];
      for (var i = 0; i < carts.length; i++) {
        if (carts[i].status == "paid") {
          result.push(carts[i]);
        }
      }
      return {
        body: thymeleaf.render(resolve("emails.html"), { orders: result }),
        contentType: "text/html"
      };
      break;
    default:
      var carts = cartLib.getCreatedCarts();
      view = resolve("ordersList.html");
      return {
        body: thymeleaf.render(view, {
          pageComponents: helpers.getPageComponents(req),
          carts: carts
        }),
        contentType: "text/html"
      };
      break;
  }
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req),
      cart: cartLib.getCart(params.id),
      carts: carts,
      products: contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [app.name + ":product"]
      }).hits
    }),
    contentType: "text/html"
  };
};
exports.post = function(req) {
  var params = req.params;
  var view = resolve("orders.html");
  switch (params.action) {
    case "addItem":
      if (params.size.trim() == "") {
        params.size = null;
      }
      cartLib.modify(
        params.id,
        params.itemID,
        params.amount,
        params.size,
        true
      );
      break;
    case "regenerateIds":
      cartLib.generateItemsIds(params.id);
      break;
    case "setStatus":
      cartLib.setUserDetails(params.id, { status: params.status });
      break;
    case "details":
      break;
    case "sendShippedMail":
      if (params.trackNum) {
        cartLib.setUserDetails(params.id, { trackNum: params.trackNum });
      }
      var cart = cartLib.getCart(params.id);
      mailsLib.sendMail("sendShippedMail", cart.email, {
        cart: cart
      });
      break;
    case "findbyqr":
      return {
        body: thymeleaf.render(resolve("markQr.html"), {
          pageComponents: helpers.getPageComponents(req),
          cart: cartLib.getCartByQr(params.qr)
        }),
        contentType: "text/html"
      };
      break;
    case "markqr":
      cartLib.markTicketUsed(params.qr);
      return {
        body: thymeleaf.render(resolve("markQr.html"), {
          pageComponents: helpers.getPageComponents(req),
          cart: cartLib.getCartByQr(params.qr)
        }),
        contentType: "text/html"
      };
      break;
    case "resendConfirmationMail":
      var cart = cartLib.getCart(params.id);
      mailsLib.sendMail("orderCreated", cart.email, {
        cart: cart
      });
      break;
    default:
      view = resolve("ordersList.html");
      return {
        body: thymeleaf.render(view, {
          pageComponents: helpers.getPageComponents(req),
          carts: carts
        }),
        contentType: "text/html"
      };
      break;
  }
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req),
      cart: cartLib.getCart(params.id),
      products: contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [app.name + ":product"]
      }).hits
    }),
    contentType: "text/html"
  };
};
