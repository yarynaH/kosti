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
    return {
      body: thymeleaf.render(resolve("games.html"), createModel()),
      contentType: "text/html"
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
