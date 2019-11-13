var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var promosLib = require(libLocation + "promosLib");
var cartLib = require(libLocation + "cartLib");
var sharedLib = require(libLocation + "sharedLib");
var contextLib = require(libLocation + "contextLib");

exports.post = function(req) {
  var params = req.params;
  var view = resolve("addPromo.html");
  var action = params.action;
  delete params.action;
  switch (action) {
    case "checkPromo":
      return {
        body: promosLib.checkPromo(params.promo),
        promosUrl: sharedLib.generateNiceServiceUrl("promos"),
        contentType: "application/json"
      };
    case "activatePromo":
      var view = resolve("../checkout/components/promos.html");
      var cart = contextLib.runAsAdmin(function() {
        return promosLib.activatePromo(params.promoCode, params.cartId);
      });
      if (!cart) {
        return false;
      }
      var markup = thymeleaf.render(view, {
        promos: cart.price.discount.codes,
        promosUrl: sharedLib.generateNiceServiceUrl("promos")
      });
      return {
        body: {
          cart: cart,
          promos: markup,
          promosUrl: sharedLib.generateNiceServiceUrl("promos")
        },
        contentType: "application/json"
      };
    case "removePromo":
      var view = resolve("../checkout/components/promos.html");
      var cart = contextLib.runAsAdmin(function() {
        return cartLib.removePromo(params.code, params.cartId);
      });
      var markup = thymeleaf.render(view, {
        promos: cart.price.discount.codes
      });
      return {
        body: {
          cart: cart,
          promos: markup,
          promosUrl: sharedLib.generateNiceServiceUrl("promos")
        },
        contentType: "application/json"
      };
  }
};
