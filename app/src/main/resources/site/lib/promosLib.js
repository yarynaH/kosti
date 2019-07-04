var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");
var kostiUtils = require("kostiUtils");
var sharedLib = require("sharedLib");

exports.addPromo = addPromo;
exports.getPromosArray = getPromosArray;
exports.getPromoByCode = getPromoByCode;
exports.activatePromo = activatePromo;
exports.reducePromoAmount = reducePromoAmount;
exports.getAllPromos = getAllPromos;
exports.deletePromo = deletePromo;

function addPromo(data) {
  var promoRepo = sharedLib.connectRepo("promos");
  return promoRepo.create(data);
}

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

function deletePromo(id) {
  var promoRepo = sharedLib.connectRepo("promos");
  var result = promoRepo.modify({
    key: id,
    editor: editor
  });
  function editor(node) {
    node.deleted = 1;
    return node;
  }
}

function getAllPromos() {
  var promoRepo = sharedLib.connectRepo("promos");
  var queryRes = promoRepo.query({
    start: 0,
    count: -1,
    query: "deleted != 1"
  });
  var result = [];
  if (queryRes && queryRes.hits && queryRes.total > 0) {
    for (var i = 0; i < queryRes.hits.length; i++) {
      result.push(promoRepo.get(queryRes.hits[i].id));
    }
  }
  return result;
}

function reducePromoAmount(code) {
  var promoRepo = sharedLib.connectRepo("promos");
  var promo = getPromoByCode(code);
  if (result && result.hits && result.total > 0) {
    promo = promoRepo.get(result.hits[0].id);
    repo.modify({
      key: result.hits[0].id,
      editor: editor
    });
    function editor(node) {
      if (node.amount && node.amount > 0) {
        node.amount = node.amount - 1;
      }
      return node;
    }
  }
  return false;
}

function getPromoByCode(code, force) {
  var promoRepo = sharedLib.connectRepo("promos");
  if (force) {
    var query = "promoCode = '" + code + "'";
  } else {
    var query = "promoCode = '" + code + "' and deleted != 1";
  }
  var result = promoRepo.query({
    start: 0,
    count: 1,
    query: query
  });
  if (result && result.hits && result.total > 0) {
    return promoRepo.get(result.hits[0].id);
  }
  return false;
}

function activatePromo(code, cartId) {
  var promo = getPromoByCode(code);
  if (!promo || !promo.discount) {
    return false;
  }
  var cartLib = require("cartLib");
  return cartLib.addPromo(code, cartId);
}
