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
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" +
            portal.assetUrl({ path: "js/festivalGame.js" }) +
            "'></script>"
        ]
      }
    };
  }

  function createModel() {
    let user = userLib.getCurrentUser();
    let game = portal.getContent();
    game = formPlayerLib.beautifyGame(game);
    let discordUrl = null;
    if (!(user && user.data && user.data.discord)) {
      discordUrl = helpers.getDiscordUrl("api/festival/discord");
    }
    if (!game.data.players) game.data.players = [];
    game.data.players = norseUtils.forceArray(game.data.players);
    let gameSigned =
      user &&
      game &&
      game.data &&
      game.data.players &&
      game.data.players.indexOf(user._id) > -1;

    var model = {
      game: game,
      user: user,
      gameSigned: gameSigned,
      discordUrl: discordUrl,
      pageComponents: helpers.getPageComponents(req, "footerScripts")
    };

    return model;
  }

  return renderView();
}
