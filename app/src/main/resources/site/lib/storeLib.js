const contentLib = require("/lib/xp/content");
const portal = require("/lib/xp/portal");
const norseUtils = require("norseUtils");
const sharedLib = require("sharedLib");
const cartLib = require("cartLib");
const hashLib = require("hashLib");
const checkoutLib = require("checkoutLib");
const thymeleaf = require("/lib/thymeleaf");
const httpClientLib = require("/lib/http-client");
const contextLib = require("contextLib");
const mailsLib = require("mailsLib");
const ipLib = require("ipLib");
const currencyLib = require("currencyLib");

exports.getSoldTicketsAmount = getSoldTicketsAmount;
exports.getPriceBlock = getPriceBlock;
exports.checkLiqpayOrderStatus = checkLiqpayOrderStatus;
exports.beautifyProduct = beautifyProduct;
exports.getProducts = getProducts;
exports.getProductsByIds = getProductsByIds;

function checkLiqpayOrderStatus() {
  var carts = cartLib.getPendingLiqpayCarts();
  norseUtils.log(carts.length + " total pending carts found.");
  for (var i = 0; i < carts.length; i++) {
    norseUtils.log("fixing cart " + carts[i].userId);
    var data = hashLib.generateLiqpayData(
      checkoutLib.getLiqpayStatusData(carts[i])
    );
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
    norseUtils.log("cart status " + result.status);
    if (result && result.status && result.status === "success") {
      norseUtils.log("cart is paid");
      checkoutLib.checkoutCart(carts[i], "paid");
      carts[i] = contextLib.runAsAdmin(function () {
        return (carts[i] = cartLib.generateItemsIds(carts[i]._id));
      });
      norseUtils.log("sending mail");
      mailsLib.sendMail("orderCreated", carts[i].email, {
        cart: carts[i]
      });
    } else if (
      result &&
      result.status &&
      (result.status === "failure" || result.status === "error")
    ) {
      norseUtils.log("updating status");
      cartLib.modifyCartWithParams(carts[i]._id, { status: "failed" });
    }
  }
}

function getPriceBlock(id, ip) {
  let product = contentLib.get({ key: id });
  product = currencyLib.getLocalPriceForProduct(product, ip);
  return thymeleaf.render(resolve("../pages/components/store/price.html"), {
    product: product,
    sale:
      product.data.price &&
      product.data.price.amount &&
      product.data.finalPrice &&
      product.data.finalPrice.amount &&
      product.data.price.amount < product.data.finalPrice.amount
  });
}

function getSoldTicketsAmount(ids) {
  if (!ids) return false;
  let cartRepo = sharedLib.connectRepo("cart");
  ids = norseUtils.forceArray(ids);
  let orders = cartRepo.query({
    start: 0,
    count: -1,
    query: "items.id in ('" + ids.join("','") + "') and status = 'paid'"
  });
  let result = 0;
  for (let i = 0; i < orders.hits.length; i++) {
    result += countTickets(orders.hits[i].id, ids);
  }
  return result;
}

function countTickets(orderId, itemIds) {
  let cartRepo = sharedLib.connectRepo("cart");
  let order = cartRepo.get(orderId);
  let result = 0;
  order.items = norseUtils.forceArray(order.items);
  for (let i = 0; i < order.items.length; i++) {
    if (itemIds.indexOf(order.items[i].id) !== -1 && order.items[i].itemsIds) {
      order.items[i].itemsIds = norseUtils.forceArray(order.items[i].itemsIds);
      result += order.items[i].itemsIds.length;
    }
  }
  return result;
}

function getProductsByIds(ids, ip) {
  ids = norseUtils.forceArray(ids);
  let products = [];
  ids.forEach((id) => {
    let product = contentLib.get({ key: id });
    if (product) {
      products.push(beautifyProduct(product, ip));
    }
  });
  return products;
}

function beautifyProduct(product, ip) {
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
  product.priceBlock = getPriceBlock(product._id, ip);
  product = currencyLib.getLocalPriceForProduct(product, ip);
  return product;

  function getMainImage(data) {
    var image = null;
    if (data.mainImage) {
      image = norseUtils.getImage(data.mainImage, "block(264, 268)");
    }
    return image;
  }
}

function getProducts(params) {
  var content = portal.getContent();
  var category = findCategory(params.category);
  var query = "";
  if (category && category.length > 0) {
    query += " and (";
    for (var i = 0; i < category.length; i++) {
      if (i !== 0) {
        query += " or ";
      }
      query += "_parentPath LIKE '/content" + category[i]._path + "*'";
    }
    query += ")";
  } else {
    query += " and _parentPath LIKE '/content" + content._path + "*'";
  }
  if (params.theme) {
    var themes = findFilterForRelation(params.theme);
    query += " and data.theme in ('" + themes.join("','") + "')";
  }
  if (params.stock && params.stock === "1") {
    query += " and data.inventory != 0";
  }
  var sort = "_manualOrderValue DESC";
  if (params.sort && params.sort !== "") {
    sort = "data." + params.sort.replace(",", " ");
  }
  var products = contentLib.query({
    start: 0,
    count: -1,
    query: "data.inventory != '0'" + query,
    contentTypes: [app.name + ":product"],
    sort: sort,
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
  var outOfStockProducts = contentLib.query({
    start: 0,
    count: -1,
    query: "data.inventory = '0'" + query,
    contentTypes: [app.name + ":product"],
    sort: sort,
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
    products = products.hits.concat(outOfStockProducts.hits);
  }
  for (var i = 0; i < products.length; i++) {
    products[i] = beautifyProduct(products[i], params.getLocalPrice);
  }
  return products;

  function findFilterForRelation(name) {
    name = norseUtils.forceArray(name.split(","));
    var site = portal.getSiteConfig();
    var store = contentLib.get({ key: site.shopLocation });
    var filters = contentLib.query({
      query:
        "_name IN ('" +
        name.join("','") +
        "') and _parentPath LIKE '/content" +
        store._path +
        "*'",
      start: 0,
      count: -1,
      contentTypes: [app.name + ":filter"]
    });
    var result = [];
    for (var i = 0; i < filters.hits.length; i++) {
      result.push(filters.hits[i]._id);
    }
    return result;
  }

  function findCategory(name) {
    if (!name) {
      return null;
    }
    name = name.split(",");
    var result = [];
    var site = portal.getSiteConfig();
    var store = contentLib.get({ key: site.shopLocation });
    for (var i = 0; i < name.length; i++) {
      var category = contentLib.query({
        query:
          "_name = '" +
          name[i] +
          "' and _parentPath = '/content" +
          store._path +
          "'",
        start: 0,
        count: 1
      });

      if (category.hits.length === 1) {
        result.push(category.hits[0]);
      }
    }
    return result;
  }
}
