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
var qrLib = require(libLocation + "qrLib");
var hashLib = require(libLocation + "hashLib");
var mailsLib = require(libLocation + "mailsLib");
var sharedLib = require(libLocation + "sharedLib");

exports.get = function (req) {
  var toolUrl = adminLib.getToolUrl(app.name, "orders");
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
      for (var i = 0; i < carts.hits.length; i++) {
        if (carts.hits[i].status == "paid") {
          result.push(carts.hits[i]);
        }
      }
      return {
        body: thymeleaf.render(resolve("emails.html"), { orders: result }),
        contentType: "text/html"
      };
      break;
    default:
      var carts = cartLib.getCreatedCarts(req.params);
      view = resolve("ordersList.html");
      return {
        body: thymeleaf.render(view, {
          pageComponents: helpers.getPageComponents(req),
          pagination: helpers.getPagination(
            null,
            carts.total,
            10,
            params.page ? parseInt(params.page) : 0,
            req.params
          ),
          carts: carts.hits,
          params: req.params
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
      toolUrl: toolUrl,
      products: contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [app.name + ":product"]
      }).hits
    }),
    contentType: "text/html"
  };
};
exports.post = function (req) {
  var toolUrl = adminLib.getToolUrl(app.name, "orders");
  var params = req.params;
  var view = resolve("orders.html");
  switch (params.postAction) {
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
      params.id = norseUtils.forceArray(params.id)[0];
      cartLib.generateItemsIds(params.id);
      break;
    case "setStatus":
      params.id = norseUtils.forceArray(params.id)[0];
      cartLib.setUserDetails(params.id, { status: params.status });
      break;
    case "details":
      break;
    case "sendShippedMail":
      params.id = norseUtils.forceArray(params.id)[0];
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
      params.id = norseUtils.forceArray(params.id)[0];
      var cart = cartLib.getCart(params.id);
      mailsLib.sendMail("orderCreated", cart.email, {
        cart: cart
      });
      break;
    default:
      var carts = cartLib.getCreatedCarts(req.params);
      view = resolve("ordersList.html");
      return {
        body: thymeleaf.render(view, {
          pageComponents: helpers.getPageComponents(req),
          carts: carts.hits,
          params: req.params
        }),
        contentType: "text/html"
      };
      break;
  }
  return {
    body: thymeleaf.render(view, {
      toolUrl: toolUrl,
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
