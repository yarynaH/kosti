var norseUtils = require("../site/lib/norseUtils");
var blogLib = require("../site/lib/blogLib");

exports.run = function () {
  blogLib.updateSchedule();
};
