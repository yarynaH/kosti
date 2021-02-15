const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const formSharedLib = require(libLocation + "games/formSharedLib");
const cacheLib = require(libLocation + "cacheLib");
const formPlayerLib = require(libLocation + "games/formPlayerLib");

const cache = cacheLib.api.createGlobalCache({
  name: "festival",
  size: 1000,
  expire: 60 * 60 * 24
});

exports.get = handleReq;

function handleReq(req) {
  let user = userLib.getCurrentUser();
  if (
    user &&
    user.roles &&
    user.roles.moderator &&
    req.params.cache === "clear"
  ) {
    cache.api.clear();
  }

  function renderView() {
    var view = resolve("games.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    return {
      body: thymeleaf.render(resolve("games.html"), createModel()),
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" +
            portal.assetUrl({ path: "js/games.js" }) +
            "'></script>",
          "<script src='" +
            portal.assetUrl({ path: "js/festivalGame.js" }) +
            "'></script>"
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
    let filters = cache.api.getOnly("festival-filters");
    if (!filters) {
      filters = getFilters();
      cache.api.put("festival-filters", filters);
    }
    let mygamesLink = null;
    if (user)
      mygamesLink = portal.pageUrl({
        id: user._id,
        params: { action: "games" }
      });

    var model = {
      content: content,
      user: user,
      mygamesLink: mygamesLink,
      days: formSharedLib.getDays({ skipBeautify: true }),
      gamesView: thymeleaf.render(resolve("gamesBlock.html"), {
        days: days
      }),
      festival: festival,
      filters: getFilters(),
      pageComponents: helpers.getPageComponents(req, "footerScripts")
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
        game.data.gameSystem &&
        game.data.gameSystem.select &&
        game.data.gameSystem.select.system &&
        filters.system.indexOf(game.data.gameSystem.select.system) === -1
      )
        filters.system.push(game.data.gameSystem.select.system);
    });
    return filters;
  }

  return renderView();
}
