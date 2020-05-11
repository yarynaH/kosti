var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");

exports.get = function (req) {
  var params = req.params;
  var image = contentLib.query({ query: "_name = '" + req.params.id + "'" })
    .hits[0];
  return {
    body: thymeleaf.render(resolve("imageModal.html"), {
      img: portalLib.imageUrl({
        id: image._id,
        scale: "(1, 1)",
        type: "absolute"
      })
    }),
    contentType: "text/html"
  };
};
