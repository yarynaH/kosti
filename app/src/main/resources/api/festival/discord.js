const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const thymeleaf = require("/lib/thymeleaf");
const httpClientLib = require("/lib/http-client");

const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const userLib = require(libLocation + "userLib");
const helpers = require(libLocation + "helpers");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = function (req) {
  userLib.discordRegister(req.params.code, "game-signup");
  let user = userLib.getCurrentUser();
  norseUtils.log(user);
  let cart = req.cookies.cartId;
  return {
    body: thymeleaf.render(resolve("templates/discord.html"), {}),
    contentType: "text/html"
  };
};
