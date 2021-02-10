const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const thymeleaf = require("/lib/thymeleaf");
const httpClientLib = require("/lib/http-client");

const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const userLib = require(libLocation + "userLib");
const helpers = require(libLocation + "helpers");
const cartLib = require(libLocation + "cartLib");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = function (req) {
  userLib.discordRegister(req.params.code, "api/festival/discord");
  let user = userLib.getCurrentUser();
  let cart = cartLib.getCart(req.cookies.cartId);
  let game = null;
  if (cart.gameId) {
    if (formPlayerLib.updateUser(cart)) {
      game = contentLib.get({ key: cart.gameId });
      game.data.players = norseUtils.forceArray(game.data.players);
      if (game.data.players.indexOf(cart._id) !== -1) {
        game.data.players[game.data.players.indexOf(cart._id)] = user._id;
      }
      game = formPlayerLib.updateEntity(game);
      game.url = portal.pageUrl({ id: game._id });
    }
  }
  return {
    status: 302,
    headers: {
      Location: game.url
    }
  };
};
