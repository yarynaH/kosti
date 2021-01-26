const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = handleReq;

function handleReq(req) {
  function renderView() {
    return {
      body: thymeleaf.render(resolve("game.html"), createModel()),
      contentType: "text/html"
    };
  }

  function createModel() {
    let user = userLib.getCurrentUser();
    let game = portal.getContent();
    game = formPlayerLib.beautifyGame(game);

    var model = {
      game: game,
      user: user,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
