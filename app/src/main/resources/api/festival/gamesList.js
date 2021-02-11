var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");
var httpClientLib = require("/lib/http-client");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var userLib = require(libLocation + "userLib");
var helpers = require(libLocation + "helpers");
var formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = function (req) {
  if (req.params && req.params["theme[]"]) {
    req.params.theme = req.params["theme[]"];
    delete req.params["theme[]"];
  }
  return {
    body: {
      html: thymeleaf.render(
        resolve("../../site/pages/games/gamesBlock.html"),
        {
          days: formPlayerLib.getDays(req.params)
        }
      )
    },
    contentType: "application/json"
  };
};
