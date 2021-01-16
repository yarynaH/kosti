var thymeleaf = require("/lib/thymeleaf");
var authLib = require("/lib/xp/auth");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var util = require("/lib/util");

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
    var slider = getSlider(content.data.slider);
    up.ip = req.remoteAddress;

    var model = {
      presetFilters: up,
      content: content,
      cart: cartLib.getCart(req.cookies.cartId),
      social: site.social,
      slider: slider,
      filters: getFiltersObject(),
      products: thymeleaf.render(resolve("productsBlock.html"), {
        products: storeLib.getProducts(up)
      }),
      cartUrl: sharedLib.generateNiceServiceUrl("cart"),
      pageComponents: helpers.getPageComponents(req)
    };
    return model;
  }

  function getSlider(config) {
    if (!config) {
      return null;
    }
    config = norseUtils.forceArray(config);
    config.forEach((c) => {
      c.image = norseUtils.getImage(c.image, "block(1905, 378)");
      c.url = portal.pageUrl({ id: c.product });
    });
    return config;
  }

  function getFiltersObject() {
    var filters = getFilters();
    filters.push({
      items: getCategories(),
      title: "Категории",
      name: "category"
    });
    return filters;
  }

  function getFilters() {
    var result = [];
    var site = portal.getSiteConfig();
    var store = contentLib.get({ key: site.shopLocation });
    var filtersCategories = util.content.getChildren({
      key: store.data.filtersLocation
    }).hits;
    for (var i = 0; i < filtersCategories.length; i++) {
      var filters = util.content.getChildren({
        key: filtersCategories[i]._id
      }).hits;
      var temp = {
        title: filtersCategories[i].displayName,
        items: [],
        name: filtersCategories[i]._name
      };
      for (var j = 0; j < filters.length; j++) {
        temp.items.push({
          value: filters[j]._name,
          title: filters[j].displayName
        });
      }
      result.push(temp);
    }
    return result;
  }

  function getCategories() {
    var site = portal.getSiteConfig();
    var store = contentLib.get({ key: site.shopLocation });
    var categories = util.content.getChildren({
      key: site.shopLocation
    }).hits;
    var result = [];
    for (var i = 0; i < categories.length; i++) {
      if (
        store.data.filtersLocation === categories[i]._id ||
        categories[i].type !== "base:folder" ||
        !checkCategoryHasChildren(categories[i])
      ) {
        continue;
      }
      result.push({
        value: categories[i]._name,
        title: categories[i].displayName
      });
    }
    return result;

    function checkCategoryHasChildren(category) {
      var products = contentLib.query({
        start: 0,
        count: 1,
        query: "_parentPath LIKE '/content" + category._path + "*'",
        contentTypes: [app.name + ":product"],
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
      if (products.total > 0) {
        return true;
      }
      return false;
    }
  }

  return renderView();
}
