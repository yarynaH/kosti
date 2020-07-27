const norseUtils = require("../site/lib/norseUtils");
const homepageLib = require(libLocation + "homepageLib");

exports.run = function () {
  homepageLib.updateCache();
};
