const thymeleaf = require("/lib/thymeleaf");
const portalLib = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const contextLib = require("/site/lib/contextLib");
const norseUtils = require("/site/lib/norseUtils");

exports.get = handleGet;

function handleGet(req) {
  function renderView() {
    var body = thymeleaf.render(resolve("cache.html"), {
      url: portalLib.pageUrl({
        id: req.params.contentId,
        params: { cache: "clear" }
      })
    });
    return {
      body: body,
      contentType: "text/html"
    };
  }

  return renderView();
}
