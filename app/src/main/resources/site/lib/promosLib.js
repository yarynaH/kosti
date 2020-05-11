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
exports.setCodeAsUsed - setCodeAsUsed;

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
  var query = "(data.code = '" + code + "' AND data.amount > 0)";
  query +=
    " OR (data.codeType._selected = 'same' AND data.codeType.same.code = '" +
    code +
    "')";
  query +=
    " OR (data.codeType._selected = 'unique' AND data.codeType.unique.unique.code = '" +
    code +
    "')";
  var result = contentLib.query({
    start: 0,
    count: 1,
    query: query
  });
  if (result.hits[0] && isPromoValid(result.hits[0], code)) {
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
    var promoData = node.data.codeType;
    if (promoData._selected === "unique") {
      if (promoData.unique.unique) {
        var codes = norseUtils.forceArray(promoData.unique.unique);
        for (var i = 0; i < codes.length; i++) {
          if (codes[i].code === code && codes[i].used !== true) {
            node.data.codeType.unique.unique[i].code = true;
            break;
          }
        }
      }
    } else if (promoData._selected === "same") {
      if (promoData.same.amount > 0) {
        node.data.codeType.same.amount = ode.data.codeType.same.amount - 1;
      }
    }
    return node;
  }
}

function isPromoValid(promo, code) {
  if (
    !(
      promo &&
      promo.data &&
      promo.data.codeType &&
      promo.data.codeType._selected
    )
  ) {
    return false;
  }
  var promoData = promo.data.codeType;
  if (promoData._selected === "unique") {
    if (promoData.unique.unique) {
      var codes = norseUtils.forceArray(promoData.unique.unique);
      for (var i = 0; i < codes.length; i++) {
        if (codes[i].code === code && codes[i].used !== true) {
          return true;
        }
      }
    }
  } else if (promoData._selected === "same") {
    if (promoData.same.amount > 0) {
      return true;
    }
  }
  return false;
}

function setCodeAsUsed(code) {}
