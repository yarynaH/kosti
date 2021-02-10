const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const formSharedLib = require(libLocation + "games/formSharedLib");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

exports.get = handleReq;

function handleReq(req) {
  function renderView() {
    var view = resolve("games.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var jquery = portal.assetUrl({ path: "js/jquery-2.2.0.min.js" });
    var typeText = portal.assetUrl({ path: "js/jquery.animateTyping.js" });
    var fileName = portal.assetUrl({ path: "js/games.js" });
    return {
      body: thymeleaf.render(resolve("games.html"), createModel()),
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" + fileName + "'></script>",
          "<script src='" + typeText + "'></script>"
        ]
      }
    };
  }

  function createModel() {
    let user = userLib.getCurrentUser();
    let content = portal.getContent();
    let festival = formSharedLib.getActiveFestival();
    let days = formPlayerLib.getDays({
      getBlocks: true,
      dayId: req.params.dayId,
      system: req.params.system,
      theme: req.params.theme
    });

    var model = {
      content: content,
      user: user,
      days: days,
      festival: festival,
      filters: getFilters(),
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  function getFilters() {
    let filters = { themes: [], system: [] };
    let festival = formSharedLib.getActiveFestival();
    let games = formSharedLib.getItemsList({
      parentId: festival._id,
      type: "game",
      parentPathLike: true
    });
    games.forEach((game) => {
      if (game.data.theme && filters.themes.indexOf(game.data.theme) === -1)
        filters.themes.push(game.data.theme);
      if (
        game.data.gameSystem.select.system &&
        filters.system.indexOf(game.data.gameSystem.select.system) === -1
      )
        filters.system.push(game.data.gameSystem.select.system);
    });
    return filters;
  }

  return renderView();
}
