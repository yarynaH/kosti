var thymeleaf = require("/lib/thymeleaf");

var libLocation = "/site/lib/";
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");
var norseUtils = require(libLocation + "norseUtils");

exports.get = function (req) {
  var params = req.params;
  var model = {
    email: params.email,
    hash: params.hash,
    hashMatch: userLib.forgotPass(
      decodeURIComponent(params.email),
      params.hash
    ),
    pageComponents: helpers.getPageComponents(req)
  };
  return {
    body: thymeleaf.render(resolve("components/forgotPassForm.html"), model),
    contentType: "text/html"
  };
};

exports.post = function (req) {
  var result = false;
  var params = req.params;
  result = userLib.resetPass(params.email);
  return {
    body: result,
    contentType: "application/json"
  };
};
