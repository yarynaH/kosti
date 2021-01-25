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
    let days = formPlayerLib.getDays({ getBlocks: true });

    var model = {
      content: content,
      user: user,
      days: days,
      festival: festival,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
