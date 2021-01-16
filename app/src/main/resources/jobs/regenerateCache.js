const norseUtils = require("../site/lib/norseUtils");
const homepageLib = require("../site/lib/homepageLib");

exports.run = function () {
  homepageLib.updateCache();
};
