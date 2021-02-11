const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const thymeleaf = require("/lib/thymeleaf");
const httpClientLib = require("/lib/http-client");

const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const userLib = require(libLocation + "userLib");
const helpers = require(libLocation + "helpers");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.post = function (req) {
  return {
    /*body: formPlayerLib.checkTicket({
      ticket: req.params.ticket,
      cartId: req.cookies.cartId
    }),*/
    body: formPlayerLib.bookSpace({
      cartId: req.cookies.cartId,
      kosticonnect2021: req.params.ticket,
      firstName: req.params.firstName,
      gameId: req.params.gameId
    }),
    contentType: "application/json"
  };
};
