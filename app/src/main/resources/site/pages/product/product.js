const thymeleaf = require("/lib/thymeleaf");
const authLib = require("/lib/xp/auth");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../lib/";
const cartLib = require(libLocation + "cartLib");
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const sharedLib = require(libLocation + "sharedLib");
const storeLib = require(libLocation + "storeLib");

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
  var me = this;

  function renderView() {
    const view = resolve("product.html");
    const model = createModel();
    const body = thymeleaf.render(view, model);
    const fileName = portal.assetUrl({ path: "js/pdp.js" });
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
    content = beautifyProduct(content);
    var response = [];
    var site = portal.getSiteConfig();

    var model = {
      content: content,
      app: app,
      priceBlock: storeLib.getPriceBlock(content._id, req.remoteAddress),
      cart: cartLib.getCart(req.cookies.cartId),
      mainImage: getMainImage(content.data),
      images: getImages(content.data),
      social: site.social,
      shopUrl: portal.pageUrl({ id: site.shopLocation }),
      sizes: getSizes(content.data.sizes),
      variations: getVariations(content),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      pageComponents: helpers.getPageComponents(req)
    };
    return model;
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
    return product;
  }

  function getImages(data) {
    var images = [];
    if (data.images) {
      data.images = norseUtils.forceArray(data.images);
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
