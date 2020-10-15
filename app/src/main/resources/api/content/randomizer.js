const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");

exports.get = function (req) {
  var randomizer = contentLib.get({ key: req.params.id });
  req.params.data = norseUtils.forceArray(req.params.data);
  randomizer.data.category = norseUtils.forceArray(randomizer.data.category);
  var result = "";
  if (req.params.data.length === randomizer.data.category.length) {
    req.params.data.forEach((d, i) => {
      result +=
        randomizer.data.category[i].item[d] !== ""
          ? " " + randomizer.data.category[i].item[d]
          : "";
    });
  }
  return {
    body: { data: result.trim() },
    contentType: "application/json"
  };
};
