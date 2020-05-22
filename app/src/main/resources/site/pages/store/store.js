var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var cartLib = require(libLocation + "cartLib");
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var sharedLib = require(libLocation + "sharedLib");
var storeLib = require(libLocation + "storeLib");

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
      products: getProducts(up),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
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

  function beautifyProduct(product) {
    product.urlAbsolute = portal.pageUrl({ id: product._id, type: "absolute" });
    product.brand = {
      name: "Вечерние Кости",
      logo: portal.assetUrl({
        path: "images/extended-logo@3x.png",
        type: "absolute"
      })
    };
    product.image = getMainImage(product.data);
    product.url = portal.pageUrl({ id: product._id });
    product.priceBlock = storeLib.getPriceBlock(product._id);
    return product;
  }

  function getProducts(params) {
    var query = "";
    if (params.type) {
      query += "data.type = '" + params.type + "'";
    }
    var products = contentLib.query({
      start: 0,
      count: -1,
      query: query,
      contentTypes: [app.name + ":product"],
      sort: "_manualOrderValue DESC",
      filters: {
        boolean: {
          mustNot: {
            hasValue: [
              {
                field: "data.discontinued",
                values: "true"
              }
            ]
          }
        }
      }
    });
    if (products && products.hits) {
      products = products.hits;
    }
    for (var i = 0; i < products.length; i++) {
      products[i] = beautifyProduct(products[i]);
    }
    return products;
  }

  return renderView();
}
