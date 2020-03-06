var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var contextLib = require(libLocation + "contextLib");
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var cartLib = require(libLocation + "cartLib");
var mailsLib = require(libLocation + "mailsLib");
var sharedLib = require(libLocation + "sharedLib");
var hashLib = require(libLocation + "hashLib");
var checkoutLib = require(libLocation + "checkoutLib");
var userLib = require(libLocation + "userLib");

exports.get = function(req) {
  return generateCheckoutPage(req);
};

exports.post = function(req) {
  return generateCheckoutPage(req);
};

function generateCheckoutPage(req) {
  var params = req.params;
  var view = resolve("checkout.html");
  var model = getCheckoutMainModel(params);
  if (params.ik_inv_st) {
    params = checkoutLib.checkIKResponse(params, model);
  }
  switch (params.step) {
    case "2":
      if (!model.cart.ik_id || model.cart.ik_id == "") {
        params.ik_id =
          params.surname.toLowerCase() + "_" + new Date().getTime();
      }
      model.cart = cartLib.modifyCartWithParams(model.cart._id, params);
      var stepView = thymeleaf.render(
        resolve("components/stepTwo.html"),
        createStepTwoModel(params, req, model.cart)
      );
      model.shipping = "active";
      break;
    case "3":
      params.userId = cartLib.getNextId();
      params.status = "created";
      var user = userLib.getCurrentUser();
      if (user) {
        params.userRelation = user._id;
      }
      var shipping = checkoutLib.getShipping(model.cart.country);
      shipping = checkoutLib.getShippingById(shipping, params.shipping);
      model.cart = cartLib.modifyCartWithParams(model.cart._id, params);
      var stepView = thymeleaf.render(
        resolve("components/stepThree.html"),
        createStepThreeModel(params, req, model.cart)
      );
      model.payment = "active";
      break;
    case "interkassa":
      if (model.cart && model.cart.ik_id) {
        model.cart = cartLib.modifyCartWithParams(model.cart._id, {
          paymentMethod: "interkassa"
        });
        model.checkoutForm = thymeleaf.render(
          resolve("components/interkassaForm.html"),
          { cart: model.cart, ik_id: model.ik_id }
        );
      }
      break;
    case "liqpay":
      model.cart = cartLib.modifyCartWithParams(model.cart._id, {
        paymentMethod: "liqpay"
      });
      var liqpayData = hashLib.generateLiqpayData(
        checkoutLib.getLiqpayData(model.cart)
      );
      model.checkoutForm = thymeleaf.render(
        resolve("components/liqpayForm.html"),
        {
          liqpayData: liqpayData,
          signature: hashLib.generateLiqpaySignature(liqpayData)
        }
      );
      break;
    case "success":
      return checkoutLib.renderSuccessPage(req, model.cart, false);
      break;
    case "pending":
      return checkoutLib.renderSuccessPage(req, model.cart, true);
      break;
    default:
      var stepView = thymeleaf.render(
        resolve("components/stepOne.html"),
        createStepOneModel(params, model.cart, req)
      );
      model.info = "active";
      break;
  }
  model.stepView = stepView;
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };

  function createStepOneModel(params, cart, req) {
    return {
      shopUrl: sharedLib.getShopUrl(),
      agreementPage: portal.pageUrl({
        id: portal.getSiteConfig().agreementPage
      }),
      checkoutUrl: sharedLib.generateNiceServiceUrl("checkout"),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      params: params,
      cart: cart
    };
  }

  function createStepTwoModel(params, req, cart) {
    var site = portal.getSiteConfig();
    var shipping = contentLib.get({ key: site.shipping });
    shipping = checkoutLib.getShipping(params.country, cart.itemsWeight);
    return {
      params: params,
      shopUrl: sharedLib.getShopUrl(),
      checkoutUrl: sharedLib.generateNiceServiceUrl("checkout"),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      shipping: shipping,
      cart: cart,
      address:
        params.country.replaceAll(" ", "+") +
        "," +
        params.city.replaceAll(" ", "+") +
        "," +
        params.address.replaceAll(" ", "+")
    };
  }

  function createStepThreeModel(params, req, cart) {
    return {
      shopUrl: sharedLib.getShopUrl(),
      cart: cart,
      checkoutUrl: sharedLib.generateNiceServiceUrl("checkout"),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      error: params.error
    };
  }

  function getCheckoutMainModel(params) {
    var cart = cartLib.getCart(req.cookies.cartId);
    var site = portal.getSiteConfig();
    return {
      cart: cart,
      promos: thymeleaf.render(resolve("components/promos.html"), {
        promos: cart.price.discount.codes
      }),
      ik_id: app.config.interkassaID,
      pageComponents: helpers.getPageComponents(
        req,
        "footerCheckout",
        null,
        "Оплата и доставка"
      ),
      promosUrl: sharedLib.generateNiceServiceUrl("promos")
    };
  }
}
