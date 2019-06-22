var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var cartLib = require(libLocation + "cartLib");
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");

exports.get = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("store.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      cart: cartLib.getCart(req.cookies.cartId),
      social: site.social,
      products: getProducts(),
      pageComponents: helpers.getPageComponents(req)
    };
    return model;
  }

  function getMainImage(data) {
    var image = null;
    if (data.mainImage) {
      image = norseUtils.getImage(data.mainImage, "block(264, 268)");
    }
    return image;
  }

  function getProducts() {
    var products = contentLib.query({
      start: 0,
      count: -1,
      contentTypes: [app.name + ":product"]
    });
    if (products && products.hits) {
      products = products.hits;
    }
    for (var i = 0; i < products.length; i++) {
      products[i].image = getMainImage(products[i].data);
      products[i].url = portal.pageUrl({ id: products[i]._id });
    }
    return products;
  }

  return renderView();
}
