const norseUtils = require("norseUtils");
const contentLib = require("/lib/xp/content");
const portalLib = require("/lib/xp/portal");
const nodeLib = require("/lib/xp/node");
const contextLib = require("contextLib");
const textEncoding = require("/lib/text-encoding");
const moment = require("moment");
const hashLib = require("hashLib");
const sharedLib = require("sharedLib");

exports.addPromo = addPromo;
exports.getCart = getCart;
exports.removePromo = removePromo;
exports.getCreatedCarts = getCreatedCarts;
exports.modifyCartWithParams = modifyCartWithParams;
exports.setUserDetails = setUserDetails;
exports.modifyInventory = modifyInventory;
exports.getShippingPrice = getShippingPrice;
exports.getCartsByUser = getCartsByUser;
exports.fixCartDate = fixCartDate;
exports.fixCartPrice = fixCartPrice;
exports.getCartByQr = getCartByQr;
exports.markTicketUsed = markTicketUsed;
exports.modify = modify;
exports.generateItemsIds = generateItemsIds;
exports.getNextId = getNextId;
exports.savePrices = savePrices;
exports.fixItemIds = fixItemIds;
exports.getCartUtils = getCartUtils;
exports.getPendingLiqpayCarts = getPendingLiqpayCarts;

function getCart(cartId) {
  var cart = {};
  if (cartId) {
    cart = getCartById(cartId);
    if (!cart) {
      cart = createCart();
    }
  } else {
    cart = createCart();
  }
  cart.items = getCartItems(cart.items);
  cart.itemsNum = calculateCartItems(cart.items);
  cart.itemsWeight = caclculateCartWeight(cart.items);
  cart.dates = getCartDates(cart);
  if (!cart.price) {
    cart.price = calculateCart(cart);
  }
  cart.stock = checkCartStock(cart.items);
  return cart;
}

function getCartsByUser(email, id, count) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query:
      "(email = '" +
      email +
      "' or userRelation = '" +
      id +
      "') and status in ('failed', 'paid', 'pending', 'shipped')"
  });
  if (count) {
    return result.total;
  }
  for (var i = 0; i < result.hits.length; i++) {
    result.hits[i] = getCart(result.hits[i].id);
  }
  return result;
}

function getPendingLiqpayCarts() {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query: "paymentMethod = 'liqpay' and status = 'pending'"
  });
  var carts = [];
  for (var i = 0; i < result.hits.length; i++) {
    carts.push(cartRepo.get(result.hits[i].id));
  }
  return carts;
}

function getCartByQr(qr) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 1,
    query: "items.itemsIds.id=" + qr
  });
  if (result.total > 0) {
    var cart = getCart(result.hits[0].id);
    cart.currentQrId = qr;
    for (var i = 0; i < cart.items.length; i++) {
      cart.items = norseUtils.forceArray(cart.items);
      for (var j = 0; j < cart.items[i].itemsIds.length; j++) {
        cart.items[i].itemsIds = norseUtils.forceArray(cart.items[i].itemsIds);
        if (
          cart.items[i].itemsIds &&
          cart.items[i].itemsIds[j] &&
          cart.items[i].itemsIds[j].id == qr
        ) {
          cart.currentTicketType = contentLib.get({
            key: cart.items[i]._id
          }).data.ticketType;
          cart.qrActivated = cart.items[i].itemsIds[j].activated;
          cart.currentFriendlyId = cart.items[i].itemsIds[j].friendlyId;
          let product = contentLib.get({ key: cart.items[i]._id });
          cart.legendary = product.data.ticketType === "kostiConnectTurbo";
        }
      }
    }
    return cart;
  }
  return null;
}

function markTicketUsed(qr) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 1,
    query:
      "fulltext('items.itemsIds.id', '\"" +
      qr +
      "\"', 'OR') or ngram('items.itemsIds.id', '\"" +
      qr +
      "\"', 'OR') or items.itemsIds.id=" +
      qr
  });
  if (result.total > 0) {
    cartRepo.modify({
      key: result.hits[0].id,
      editor: editor
    });
    function editor(node) {
      if (node.items) {
        node.items = norseUtils.forceArray(node.items);
        for (var i = 0; i < node.items.length; i++) {
          node.items[i].itemsIds = norseUtils.forceArray(
            node.items[i].itemsIds
          );
          for (var j = 0; j < node.items[i].itemsIds.length; j++) {
            if (node.items[i].itemsIds[j].id == qr) {
              node.items[i].itemsIds[j].activated = true;
              return node;
            }
          }
        }
      }
      return node;
    }
  }
}

function getCreatedCarts(params) {
  var cartRepo = connectCartRepo();
  var result = [];
  var query = "_ts > '2019-03-26T07:24:47.393Z'";
  if (params.status) {
    query += " and status = '" + params.status + "'";
  } else {
    query +=
      " and status in ('failed', 'paid', 'pending', 'created', 'shipped')";
  }
  if (params.country) {
    query += " and country = '" + params.country + "'";
  }
  if (params.search) {
    query +=
      " and fulltext('_allText', '\"" +
      params.search +
      "\"', 'OR') or ngram('_allText', '\"" +
      params.search +
      "\"', 'OR')";
  }
  params.page = params.page ? parseInt(params.page) : 1;
  var carts = cartRepo.query({
    start: (params.page - 1) * 10,
    count: 30,
    query: query,
    sort: "_ts desc"
  });
  for (var i = 0; i < carts.hits.length; i++) {
    result.push(getCart(carts.hits[i].id));
  }
  return { hits: result, total: carts.total };
}

function modifyCartWithParams(id, params) {
  return contextLib.runAsAdmin(function () {
    return setUserDetails(id, params);
  });
}

function savePrices(cartId) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });

  function editor(node) {
    if (node.items) {
      node.items = norseUtils.forceArray(node.items);
      for (var i = 0; i < node.items.length; i++) {
        var item = contextLib.runInDefault(function () {
          return contentLib.get({ key: node.items[i].id });
        });
        if (item && item.data && item.data.price) {
          node.items[i].transactionPrice = item.data.price;
        }
      }
    }
    return node;
  }
}

function modify(cartId, id, amount, itemSize, force) {
  var cart = getCart(cartId);
  var cartRepo = connectCartRepo();
  var item = contentLib.get({ key: id });
  if (item && item.data && item.data.generateIds) {
    var generateIds = parseInt(item.data.generateIds);
  }
  var result = cartRepo.modify({
    key: cart._id,
    editor: editor
  });
  result = getCart(cartId);

  function editor(node) {
    if (node.items) {
      node.items = norseUtils.forceArray(node.items);
      for (var i = 0; i < node.items.length; i++) {
        if (node.items[i].id == id && node.items[i].itemSize == itemSize) {
          if (force) {
            node.items[i].amount = amount;
          } else {
            node.items[i].amount =
              parseInt(node.items[i].amount) + parseInt(amount);
          }
          node.items[i].generateIds = generateIds
            ? generateIds
            : node.items[i].generateIds;
          if (parseInt(amount) < 1) {
            delete node.items[i];
          }
          return node;
        }
      }
      node.items.push({
        id: id,
        amount: amount,
        itemSize: itemSize,
        generateIds: generateIds ? generateIds : null
      });
      return node;
    } else {
      node.items = [
        {
          id: id,
          amount: amount,
          itemSize: itemSize,
          generateIds: generateIds ? generateIds : null
        }
      ];
      return node;
    }
  }
  return result;
}

function modifyInventory(items) {
  items = norseUtils.forceArray(items);
  for (var i = 0; i < items.length; i++) {
    if (items[i].id && !items[i]._id) {
      items[i]._id = items[i].id;
    }
    var result = contentLib.modify({
      key: items[i]._id,
      requireValid: false,
      editor: function (node) {
        return editor(node, items[i]);
      }
    });
    contentLib.publish({
      keys: [items[i]._id],
      sourceBranch: "master",
      targetBranch: "draft"
    });
  }
  function editor(node, item) {
    if (typeof node.data.inventory !== "undefined" && node.data.inventory > 0) {
      node.data.inventory = node.data.inventory - item.amount;
    }
    if (node.data.sizes) {
      node.data.sizes = norseUtils.forceArray(node.data.sizes);
      for (var j = 0; j < node.data.sizes.length; j++) {
        if (node.data.sizes[j].title == item.itemSize) {
          node.data.sizes[j].amount = node.data.sizes[j].amount - item.amount;
          break;
        }
      }
    }
    return node;
  }
}

function setUserDetails(cartId, params) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });

  function editor(node) {
    node.country = params.country ? params.country : node.country;
    node.address = params.address ? params.address : node.address;
    node.city = params.city ? params.city : node.city;
    node.phone = params.phone ? params.phone : node.phone;
    node.surname = params.surname ? params.surname : node.surname;
    node.name = params.name ? params.name : node.name;
    node.shipping = params.shipping ? params.shipping : node.shipping;
    node.email = params.email ? params.email : node.email;
    node.cartId = params.cartId ? params.cartId : node.cartId;
    node.step = params.step ? params.step : node.step;
    node.status = params.status ? params.status : node.status;
    node.ik_id = params.ik_id ? params.ik_id : node.ik_id;
    node.userId = node.userId ? node.userId : getNextId();
    node.index = params.index ? params.index : node.index;
    node.paymentMethod = params.paymentMethod
      ? params.paymentMethod
      : node.paymentMethod;
    node.userRelation = params.userRelation
      ? params.userRelation
      : node.userRelation;
    node.transactionDate = params.transactionDate
      ? params.transactionDate
      : node.transactionDate;
    node.novaPoshtaСity = params.novaPoshtaСity
      ? params.novaPoshtaСity
      : node.novaPoshtaСity;
    node.novaPoshtaWarehouse = params.novaPoshtaWarehouse
      ? params.novaPoshtaWarehouse
      : node.novaPoshtaWarehouse;
    node.shippingPrice = params.shippingPrice
      ? params.shippingPrice
      : node.shippingPrice;
    node.trackNum = params.trackNum ? params.trackNum : node.trackNum;
    node.price = params.price ? params.price : node.price;
    return node;
  }
  return getCart(cartId);
}

function getCartUtils() {
  var cartRepo = connectCartRepo();
  var utils = cartRepo.query({
    query: "_name = 'utils'"
  });
  if (utils.hits[0]) {
    return cartRepo.get(utils.hits[0].id);
  } else {
    return cartRepo.create({
      _name: "utils",
      ticketCount: 0
    });
  }
}

function modifyCartUtils(data) {
  var cartRepo = connectCartRepo();
  var utils = getCartUtils();
  var result = cartRepo.modify({
    key: utils._id,
    editor: editor
  });
  function editor(node) {
    node.ticketCount = data.ticketCount ? data.ticketCount : node.ticketCount;
    return node;
  }
}

function generateItemsIds(cartId) {
  var cartRepo = connectCartRepo();
  var utils = getCartUtils();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });
  modifyCartUtils({ ticketCount: utils.ticketCount });
  function editor(node) {
    if (node && node.items) {
      node.items = norseUtils.forceArray(node.items);
      for (var i = 0; i < node.items.length; i++) {
        node.items[i].itemsIds = [];
        var item = contextLib.runInDefault(function () {
          return contentLib.get({ key: node.items[i].id });
        });
        if (item.data.type !== "ticket") {
          continue;
        }
        var idsCount = parseInt(node.items[i].amount);
        if (node.items[i].generateIds) {
          idsCount = idsCount * parseInt(node.items[i].generateIds);
        }
        for (var j = 0; j < idsCount; j++) {
          utils.ticketCount++;
          node.items[i].itemsIds.push({
            id: hashLib.createNiceNumericHash(
              node.name +
                " " +
                node.surname +
                " " +
                node.items[i].id +
                " " +
                new Date().getTime() +
                " " +
                j +
                " " +
                i
            ),
            activated: false,
            friendlyId: utils.ticketCount
          });
        }
      }
    }
    return node;
  }
  return getCart(cartId);
}

function getNextId() {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: 1,
    query: ""
  });
  return parseInt(
    result.total + 1 + "" + new Date().getUTCMilliseconds()
  ).toFixed();
}

function connectCartRepo() {
  return nodeLib.connect({
    repoId: "cart",
    branch: "master"
  });
}

function createCart() {
  var cart = null;
  contextLib.runAsAdmin(function () {
    var cartRepo = connectCartRepo();
    cart = cartRepo.create({ userId: getNextId() });
  });
  return cart;
}

function getCartById(id) {
  var cartRepo = connectCartRepo();
  try {
    var cart = cartRepo.get(id);
    return cart;
  } catch (e) {
    return createCart();
  }
}

function calculateCart(cart) {
  if (!cart || !cart.items) {
    return {
      items: 0,
      shipping: 0,
      total: 0,
      currency: "UAH"
    };
  }
  var items = norseUtils.forceArray(cart.items);
  if (items == []) {
    return {
      items: 0,
      shipping: 0,
      total: 0,
      currency: "UAH"
    };
  }
  var result = 0;
  for (var i = 0; i < items.length; i++) {
    var item = contentLib.get({ key: items[i]._id });
    if (item && item.data && item.data.price) {
      result += item.data.price * parseInt(items[i].amount);
    }
  }
  if (cart.shippingPrice) {
    var shipping = parseInt(cart.shippingPrice);
  } else {
    var shipping = getShippingPrice(cart);
  }
  var discount = checkCartDiscount(cart, result);
  return {
    items: result.toFixed(),
    shipping: shipping.toFixed(),
    discount: discount,
    totalDiscount: Math.max(result + shipping - discount.discount, 0).toFixed(),
    total: (result + shipping).toFixed()
  };
}

function getCartDates(cart) {
  return {
    createdDate: moment(cart._ts).format("DD.MM.YYYY"),
    createdTime: moment(cart._ts).format("DD.MM.YYYY HH:MM"),
    transactionDate: moment(cart.transactionDate).format("DD.MM.YYYY"),
    transactionTime: moment(cart.transactionDate).format("DD.MM.YYYY HH:MM")
  };
}

function getCartItems(items) {
  if (!items) {
    return [];
  }
  items = norseUtils.forceArray(items);
  if (items == []) {
    return [];
  }
  var result = [];
  for (var i = 0; i < items.length; i++) {
    var item = contentLib.get({ key: items[i].id });
    if (item && item.data && typeof item.data.inventory === "undefined") {
      item.data.inventory = 99999999;
    }
    if (items[i].itemsIds) {
      items[i].itemsIds = norseUtils.forceArray(items[i].itemsIds);
      for (var n = 0; n < items[i].itemsIds.length; n++) {
        if (items[i].itemsIds[n] && items[i].itemsIds[n].id) {
          if (parseInt(items[i].itemsIds[n].id)) {
            items[i].itemsIds[n].id = parseInt(
              items[i].itemsIds[n].id
            ).toFixed();
          }
        }
      }
    }
    if (item && item.data) {
      result.push({
        _id: item._id,
        imageCart: norseUtils.getImage(
          item.data.mainImage,
          "block(140, 140)",
          false,
          "absolute"
        ),
        imageSummary: norseUtils.getImage(
          item.data.mainImage,
          "block(90, 90)",
          false,
          "absolute"
        ),
        displayName: item.displayName,
        stock: item.data.inventory >= parseInt(items[i].amount),
        preorder: item.data.preorder,
        price: item.data.price,
        finalPrice: item.data.finalPrice,
        amount: parseInt(items[i].amount).toFixed(),
        itemSize: items[i].itemSize,
        digital: item.data.digital ? true : false,
        ticketType: item.data.ticketType ? item.data.ticketType : false,
        productType: item.data.type,
        transactionPrice: items[i].transactionPrice
          ? items[i].transactionPrice
          : false,

        itemSizeStock: checkItemSizeStock(
          items[i].itemSize,
          parseInt(items[i].amount),
          item._id
        ),
        itemsIds: norseUtils.forceArray(items[i].itemsIds)
      });
    }
  }
  return result;
}

function calculateCartItems(items) {
  if (!items) {
    return 0;
  }
  items = norseUtils.forceArray(items);
  if (items == []) {
    return 0;
  }
  var result = 0;
  for (var i = 0; i < items.length; i++) {
    result += parseInt(items[i].amount);
  }
  return result.toFixed();
}

function caclculateCartWeight(items) {
  if (!items) {
    return 0;
  }
  items = norseUtils.forceArray(items);
  if (items == []) {
    return 0;
  }
  var result = 0;
  for (var i = 0; i < items.length; i++) {
    var item = contentLib.get({ key: items[i]._id });
    if (item && item.data && item.data.weight) {
      result += parseFloat(item.data.weight) * parseInt(items[i].amount);
    }
  }
  return result;
}

function getShippingPrice(cart) {
  var site = sharedLib.getSiteConfig();
  var shipping = contentLib.get({ key: site.shipping });
  for (var i = 0; i < shipping.data.shipping.length; i++) {
    if (shipping.data.shipping[i].country.indexOf(cart.country) != -1) {
      var shippingMethods = norseUtils.forceArray(
        shipping.data.shipping[i].methods
      );
      break;
    }
  }
  if (!shippingMethods) {
    return 0;
  }
  for (var i = 0; i < shippingMethods.length; i++) {
    if (shippingMethods[i].id == cart.shipping) {
      var method = norseUtils.forceArray(shippingMethods[i].priceList);
      break;
    }
  }
  if (!method) {
    return 0;
  }
  for (var i = 0; i < method.length; i++) {
    if (parseFloat(cart.itemsWeight) < parseFloat(method[i].weight)) {
      return parseInt(method[i].price);
    }
  }
  return method[method.length - 1].price;
}

function checkCartStock(items) {
  for (var i = 0; i < items.length; i++) {
    if (!items[i].stock || !items[i].itemSizeStock) {
      return false;
    }
  }
  return true;
}

function checkItemSizeStock(size, amount, id) {
  var item = contentLib.get({ key: id });
  if (item && item.data && item.data.sizes) {
    var sizes = norseUtils.forceArray(item.data.sizes);
    for (var i = 0; i < sizes.length; i++) {
      if (sizes[i].title == size) {
        if (parseInt(amount) <= parseInt(sizes[i].amount)) {
          return true;
          break;
        }
      }
    }
  } else {
    return true;
  }
  return false;
}

function checkCartDiscount(cart, itemsTotal) {
  if (!cart.promos) {
    return {
      discount: 0,
      codes: []
    };
  }
  var discount = 0;
  var promosLib = require("promosLib");
  var promos = promosLib.getPromosArray(cart.promos);
  var cartCodes = [];
  for (var i = 0; i < promos.length; i++) {
    if (!promos[i] || !promos[i].data) {
      continue;
    }
    if (promos[i].data.type == "percent") {
      discount += itemsTotal * (promos[i].data.discount / 100);
    } else {
      discount += parseInt(promos[i].data.discount);
    }
    cartCodes.push({
      displayName: promos[i].displayName,
      type: promos[i].data.type,
      discount: promos[i].data.discount,
      code: promos[i].code
    });
  }
  return {
    discount: discount.toFixed(),
    codes: cartCodes
  };
}

function addPromo(code, cartId) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });
  return getCart(result._id);
  function editor(node) {
    if (!node.promos) {
      node.promos = [];
    }
    node.promos = norseUtils.forceArray(node.promos);
    if (node.promos.indexOf(code) == -1) {
      node.promos.push(code);
    }
    return node;
  }
}

function removePromo(code, cartId) {
  var cartRepo = connectCartRepo();
  var result = cartRepo.modify({
    key: cartId,
    editor: editor
  });
  return getCart(result._id);
  function editor(node) {
    if (!node.promos) {
      return node;
    }
    node.promos = norseUtils.forceArray(node.promos);
    node.promos.splice(node.promos.indexOf(code), 1);
    return node;
  }
}

function fixCartDate() {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query: "status in ('failed', 'paid', 'pending', 'shipped')",
    filters: {
      notExists: {
        field: "transactionDate"
      }
    }
  });
  norseUtils.log(
    "Fixing cart transaction date for " + result.total + " items."
  );
  for (var i = 0; i < result.hits.length; i++) {
    result.hits[i] = cartRepo.get(result.hits[i].id);
    setUserDetails(result.hits[i]._id, { transactionDate: result.hits[i]._ts });
  }
}

function fixCartPrice(force) {
  if (!force) {
    var filters = {
      notExists: {
        field: "price"
      }
    };
  } else {
    filters = {};
  }
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query: "status in ('failed', 'paid', 'pending', 'shipped')",
    filters: filters
  });
  norseUtils.log("Fixing cart price for " + result.total + " items.");
  for (var i = 0; i < result.hits.length; i++) {
    result.hits[i] = getCart(result.hits[i].id);
    setUserDetails(result.hits[i]._id, { price: result.hits[i].price });
  }
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query: "status in ('failed', 'paid', 'pending', 'shipped')",
    filters: {
      notExists: {
        field: "items.transactionPrice"
      }
    }
  });
  norseUtils.log("Fixing items price for " + result.total + " items.");
  for (var i = 0; i < result.hits.length; i++) {
    result.hits[i] = getCart(result.hits[i].id);
    savePrices(result.hits[i]._id);
  }
}

function fixItemIds() {
  var cartRepo = connectCartRepo();
  var result = cartRepo.query({
    start: 0,
    count: -1,
    query: "status in ('failed', 'paid', 'pending', 'shipped')",
    filters: {
      notExists: {
        field: "items.itemsIds.id"
      }
    }
  });
  norseUtils.log("Fixing cart ids for " + result.total + " items.");
  for (var i = 0; i < result.hits.length; i++) {
    generateItemsIds(result.hits[i].id);
  }
}
