const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const thymeleaf = require("/lib/thymeleaf");
const httpClientLib = require("/lib/http-client");

const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const userLib = require(libLocation + "userLib");
const helpers = require(libLocation + "helpers");

exports.get = function (req) {
  if (req.params.code) {
    userLib.discordRegister(req.params.code, "game-signup");
  }
  let user = userLib.getCurrentUser();
  let cart = req.cookies.cartId;
  return {
    body: thymeleaf.render(resolve("templates/discord.html.html"), {}),
    contentType: "text/html"
  };
};
