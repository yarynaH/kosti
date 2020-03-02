var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var contextLib = require("contextLib");
var norseUtils = require("norseUtils");
var helpers = require("helpers");
var cartLib = require("cartLib");
var mailsLib = require("mailsLib");
var sharedLib = require("sharedLib");
var promosLib = require("promosLib");

exports.getShipping = getShipping;
exports.getShippingById = getShippingById;
exports.renderSuccessPage = renderSuccessPage;
exports.checkIKResponse = checkIKResponse;
exports.getLiqpayData = getLiqpayData;
exports.getLiqpayStatusData = getLiqpayStatusData;
exports.checkoutCart = checkoutCart;

function checkoutCart(cart, status) {
  cartLib.modifyCartWithParams(cart._id, {
    status: status,
    transactionDate: new Date(),
    price: cart.price
  });
  contextLib.runAsAdmin(function() {
    cartLib.savePrices(cart._id);
    cartLib.modifyInventory(cart.items);
    if (cart.promos) {
      promosLib.reduceUsePromos(cart.promos);
    }
  });
}

function getLiqpayData(cart) {
  return {
    public_key: app.config.liqpayPublicKey,
    version: "3",
    action: "pay",
    currency: "UAH",
    description: "test",
    order_id: cart.userId,
    result_url: sharedLib.generateNiceServiceUrl(
      "/payment-processing",
      null,
      true
    ),
    amount: cart.price.totalDiscount
  };
}

function getLiqpayStatusData(cart) {
  return {
    public_key: app.config.liqpayPublicKey,
    version: "3",
    action: "status",
    order_id: cart.userId
  };
}

function getShipping(country, weight) {
  if (parseFloat(weight) === 0) {
    return [
      {
        id: "digital",
        title: "Цифровая доставка",
        price: 0,
        terms:
          "Ваш заказ будет отправлен на Вашу електронную почту как только вы пройдете этап оплаты"
      }
    ];
  }
  var site = portal.getSiteConfig();
  var shipping = contentLib.get({ key: site.shipping });
  var result = [];
  shipping.data.shipping = norseUtils.forceArray(shipping.data.shipping);
  for (var i = 0; i < shipping.data.shipping.length; i++) {
    if (shipping.data.shipping[i].country.indexOf(country) != -1) {
      result = getShippingsWithPrices(
        shipping.data.shipping[i],
        country,
        weight
      );
    }
  }
  return result;
}

function getShippingsWithPrices(shipping, country, weight) {
  var result = [];
  shipping.methods = norseUtils.forceArray(shipping.methods);
  for (var j = 0; j < shipping.methods.length; j++) {
    var price = cartLib.getShippingPrice({
      country: country,
      itemsWeight: weight,
      shipping: shipping.methods[j].id
    });
    result.push({
      id: shipping.methods[j].id,
      title: shipping.methods[j].title,
      price: price.toFixed(),
      terms: shipping.methods[j].terms
    });
  }
  return result;
}

function getShippingById(shipping, id) {
  for (var i = 0; i < shipping.length; i++) {
    if (shipping[i].id == id) {
      return shipping[i];
    }
  }
}

function renderSuccessPage(req, cart, pendingPage) {
  if (!pendingPage) {
    cart = contextLib.runAsAdmin(function() {
      return (cart = cartLib.generateItemsIds(cart._id));
    });
    mailsLib.sendMail("orderCreated", cart.email, {
      cart: cart
    });
  } else {
    mailsLib.sendMail(
      "pendingItem",
      ["maxskywalker94@gmail.com", "demura.vi@gmail.com"],
      {
        id: cart._id
      }
    );
  }
  return {
    body: thymeleaf.render(
      resolve("../../services/checkout/components/success.html"),
      {
        pageComponents: helpers.getPageComponents(req),
        cart: cart,
        pendingPage: pendingPage,
        shopUrl: sharedLib.getShopUrl()
      }
    ),
    contentType: "text/html"
  };
}

function checkIKResponse(params, model) {
  if (params.ik_inv_st == "success") {
    params.step = "success";
    cartLib.modifyCartWithParams(model.cart._id, {
      status: "paid",
      transactionDate: new Date(),
      price: model.cart.price
    });
    contextLib.runAsAdmin(function() {
      cartLib.savePrices(model.cart._id);
      cartLib.modifyInventory(model.cart.items);
      if (model.cart.promos) {
        promosLib.reduceUsePromos(model.cart.promos);
      }
    });
  } else if (params.ik_inv_st == "fail" || params.ik_inv_st == "canceled") {
    params.error = true;
    params.step = "3";
    cartLib.modifyCartWithParams(model.cart._id, { status: "failed" });
  } else if (params.ik_inv_st == "waitAccept") {
    params.step = "pending";
    contextLib.runAsAdmin(function() {
      cartLib.modifyInventory(model.cart.items);
      cartLib.savePrices(model.cart._id);
      cartLib.modifyCartWithParams(model.cart._id, {
        status: "pending",
        transactionDate: new Date(),
        price: model.cart.price
      });
    });
  }
  return params;
}
