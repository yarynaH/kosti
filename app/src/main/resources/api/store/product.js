var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");

var libLocation = "/site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var storeLib = require(libLocation + "storeLib");

exports.get = function (req) {
  var products = thymeleaf.render(
    resolve("/site/pages/store/productsBlock.html"),
    {
      products: storeLib.getProducts(req.params)
    }
  );
  return {
    body: { html: products },
    contentType: "application/json"
  };
};
