var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var promosLib = require(libLocation + "promosLib");
var cartLib = require(libLocation + "cartLib");
var sharedLib = require(libLocation + "sharedLib");

exports.get = function(req) {
  var params = req.params;
  if (params.action === "deletePromo") {
    promosLib.deletePromo(params.promoId);
  }
  var view = resolve("addPromo.html");
  var model = {
    pageComponents: helpers.getPageComponents(req),
    promos: promosLib.getAllPromos(),
    promosUrl: sharedLib.generateNiceServiceUrl("promos")
  };
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };
};

exports.post = function(req) {
  var params = req.params;
  var view = resolve("addPromo.html");
  var action = params.action;
  delete params.action;
  switch (action) {
    case "addPromo":
      var model = {
        pageComponents: helpers.getPageComponents(req),
        promosUrl: sharedLib.generateNiceServiceUrl("promos")
      };
      promosLib.addPromo(params);
      return {
        body: thymeleaf.render(view, model),
        contentType: "text/html"
      };
    case "checkPromo":
      return {
        body: promosLib.checkPromo(params.promo),
        promosUrl: sharedLib.generateNiceServiceUrl("promos"),
        contentType: "application/json"
      };
    case "activatePromo":
      var view = resolve("../checkout/promos.html");
      var res = promosLib.activatePromo(params.promoCode, params.cartId);
      var markup = thymeleaf.render(view, {
        promos: res.price.discount.codes,
        promosUrl: sharedLib.generateNiceServiceUrl("promos")
      });
      return {
        body: {
          cart: promosLib.activatePromo(params.promoCode, params.cartId),
          promos: markup,
          promosUrl: sharedLib.generateNiceServiceUrl("promos")
        },
        contentType: "application/json"
      };
    case "removePromo":
      var view = resolve("../checkout/promos.html");
      var res = cartLib.removePromo(params.code, params.cartId);
      var markup = thymeleaf.render(view, { promos: res.price.discount.codes });
      return {
        body: {
          cart: cartLib.removePromo(params.code, params.cartId),
          promos: markup,
          promosUrl: sharedLib.generateNiceServiceUrl("promos")
        },
        contentType: "application/json"
      };
  }
};
