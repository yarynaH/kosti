const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");

exports.get = handleReq;

function handleReq(req) {
  function renderView() {
    var model = createModel();
    var body = thymeleaf.render(resolve("games.html"), model);
    return {
      body: body,
      contentType: "text/html"
    };
  }

  function createModel() {
    var user = userLib.getCurrentUser();
    var content = portal.getContent();

    var model = {
      content: content,
      user: user,
      pageComponents: helpers.getPageComponents(req)
    };

    return model;
  }

  return renderView();
}
