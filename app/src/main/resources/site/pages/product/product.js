var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var cartLib = require(libLocation + "cartLib");
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var sharedLib = require(libLocation + "sharedLib");
var storeLib = require(libLocation + "storeLib");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    var view = resolve("product.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var fileName = portal.assetUrl({ path: "js/pdp.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: ["<script src='" + fileName + "'></script>"]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    var response = [];
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      app: app,
      priceBlock: storeLib.getPriceBlock(content._id),
      cart: cartLib.getCart(req.cookies.cartId),
      mainImage: getMainImage(content.data),
      images: getImages(content.data),
      social: site.social,
      urlAbsolute: portal.pageUrl({ id: content._id, type: "absolute" }),
      shopUrl: portal.pageUrl({ id: site.shopLocation }),
      sizes: getSizes(content.data.sizes),
      variations: getVariations(content),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      pageComponents: helpers.getPageComponents(req)
    };
    return model;
  }

  function getImages(data) {
    var images = [];
    if (data.images) {
      for (var i = 0; i < data.images.length; i++) {
        images.push(norseUtils.getImage(data.images[i], "(1, 1)"));
      }
    }
    return images;
  }

  function getMainImage(data) {
    var image = null;
    if (data.mainImage) {
      image = norseUtils.getImage(data.mainImage, "(1, 1)");
    }
    return image;
  }

  function getSizes(sizes) {
    var result = [];
    for (var size in sizes) {
      if (sizes.hasOwnProperty(size) && sizes[size] == true) {
        result.push(size);
      }
    }
    return result;
  }

  function getVariations(product) {
    var result = [];
    if (product.data.variations) {
      product.data.variations = norseUtils.forceArray(product.data.variations);
      for (var i = 0; i < product.data.variations.length; i++) {
        var variation = contentLib.get({ key: product.data.variations[i] });
        if (!variation || !variation.data || !variation.data.swatch) {
          continue;
        }
        result.push({
          swatch: norseUtils.getImage(variation.data.swatch, "block(24, 24)"),
          title: variation.displayName,
          url: portal.pageUrl({ id: variation._id })
        });
      }
    }
    return result;
  }

  return renderView();
}
