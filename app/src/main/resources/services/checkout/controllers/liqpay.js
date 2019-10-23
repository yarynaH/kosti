var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var norseUtils = require("/lib/norseUtils");
var helpers = require(libLocation + "helpers");
var cartLib = require(libLocation + "cartLib");
var sharedLib = require(libLocation + "sharedLib");

exports.get = function(req) {
  return generateCheckoutPage(req);
};

function generateCheckoutPage(req) {
  var view = resolve("../components/processing.html");
  var model = {
    shopUrl: sharedLib.getShopUrl(),
    cart: cartLib.getCart(req.cookies.cartId),
    pageComponents: helpers.getPageComponents(
      req,
      "footerCheckout",
      null,
      "Оплата и доставка"
    )
  };
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };
}
