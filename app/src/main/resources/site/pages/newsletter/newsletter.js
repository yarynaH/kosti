var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

var libLocation = "../../lib/";
var norseUtils = require(libLocation + "norseUtils");

exports.get = renderView;
exports.renderView = renderView;

function renderView(hash) {
  var userHash = "1";
  if (hash && !hash.method) {
    userHash = hash;
  }
  var view = resolve("newsletter.html");
  var site = portal.getSiteConfig();
  var content = contentLib.get({ key: site.newsletter });
  norseUtils.log(hash);
  var body = thymeleaf.render(view, {
    site: site,
    mainRegion: content.page.regions.main,
    hash: userHash
  });
  return {
    body: body,
    displayName: content.displayName,
    contentType: "text/html"
  };
}
