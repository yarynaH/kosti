var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var kostiUtils = require("kostiUtils");
var sharedLib = require("sharedLib");

exports.getPromosArray = getPromosArray;
exports.getPromoByCode = getPromoByCode;
exports.activatePromo = activatePromo;
exports.reduceUsePromos = reduceUsePromos;

function checkPromo(code) {
  var promo = getPromoByCode(code);
  return promo;
}

function getPromosArray(codes) {
  var result = [];
  codes = norseUtils.forceArray(codes);
  for (var i = 0; i < codes.length; i++) {
    result.push(getPromoByCode(codes[i]));
  }
  return result;
}

function getPromoByCode(code, force) {
  var query = "data.code = '" + code + "' and data.amount > 0";
  var result = contentLib.query({
    start: 0,
    count: 1,
    query: query
  });
  if (result.hits[0]) {
    return result.hits[0];
  }
  return false;
}

function activatePromo(code, cartId) {
  var promo = getPromoByCode(code);
  if (!promo || !promo.data.discount) {
    return false;
  }
  var cartLib = require("cartLib");
  return cartLib.addPromo(code, cartId);
}

function reduceUsePromos(codes) {
  codes = norseUtils.forceArray(codes);
  for (let i = 0; i < codes.length; i++) {
    reduceUse(codes[i]);
  }
}

function reduceUse(code) {
  var promo = getPromoByCode(code);
  var result = contentLib.modify({
    key: promo._id,
    editor: editor
  });
  contentLib.publish({
    keys: [result._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  function editor(node) {
    node.data.amount = node.data.amount - 1;
    return node;
  }
}
