var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var hashLib = require(libLocation + "hashLib");
var helpers = require(libLocation + "helpers");
var cartLib = require(libLocation + "cartLib");
var sharedLib = require(libLocation + "sharedLib");
var checkoutLib = require(libLocation + "checkoutLib");

exports.post = function(req) {
  return generateCheckoutPage(req);
};

function generateCheckoutPage(req) {
  var view = resolve("../components/processing.html");
  var cart = cartLib.getCart(req.cookies.cartId);
  var data = hashLib.generateLiqpayData(checkoutLib.getLiqpayStatusData(cart));
  var signature = hashLib.generateLiqpaySignature(data);
  var result = JSON.parse(
    httpClientLib.request({
      url: "https://www.liqpay.ua/api/request",
      method: "POST",
      connectionTimeout: 2000000,
      readTimeout: 500000,
      body: "data=" + data + "&signature=" + signature + "",
      contentType: "application/x-www-form-urlencoded"
    }).body
  );
  if (result && result.status && result.status === "success") {
    var status = "success";
  } else if (
    result &&
    result.status &&
    (result.status === "failure" ||
      result.status === "error" ||
      result.status === "try_again")
  ) {
    var status = "error";
  } else {
    var status = "pending";
  }
  var model = {
    shopUrl: sharedLib.getShopUrl(),
    cart: cart,
    status: status,
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
