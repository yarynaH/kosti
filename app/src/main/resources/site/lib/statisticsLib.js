var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var sharedLib = require("sharedLib");

exports.getCartsByProduct = getCartsByProduct;

function getCartsByProduct(params) {
  var cartRepo = sharedLib.connectRepo("cart");
  var result = [];
  var query = "_ts > '2019-03-26T07:24:47.393Z' and status = 'paid'";
  var carts = cartRepo.query({
    start: 0,
    count: -1,
    query: query,
    aggregations: {
      categories: {
        terms: {
          field: "items.id",
          order: "_count desc",
          size: 10
        }
      }
    }
  });
  return result;
}
