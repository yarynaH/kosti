var norseUtils = require("../site/lib/norseUtils");
var storeLib = require("../site/lib/blogLib");

exports.run = function() {
  storeLib.checkLiqpayOrderStatus();
};
