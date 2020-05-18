var libLocation = "/site/lib/";
var userLib = require(libLocation + "userLib");

exports.post = function (req) {
  return {
    body: userLib.uploadUserImage(),
    contentType: "application/json"
  };
};
