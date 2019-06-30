var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var blogLib = require(libLocation + "blogLib");

exports.get = function(req) {
  var params = req.params;
  //params.q - search by article name
  //params.hid - search by hashtag id
  if (params.hid) {
    var query = getHashtagName(params.hid);
    var searchRes = blogLib.getSearchArticles(params.hid, null, true);
  } else {
    var query = params.q;
    if (!query) query = "";
    var searchRes = blogLib.getSearchArticles(query, null, false);
  }

  var view = resolve("search.html");
  var site = portal.getSiteConfig();
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req),
      sidebar: blogLib.getSidebar(),
      query: query,
      loadMoreText: blogLib.getRandomString(),
      searchRes: searchRes
    }),
    contentType: "text/html"
  };
};

function getHashtagName(id) {
  if (!id) return "";
  var temp = contentLib.get({ key: id });
  if (temp && temp.displayName) return "#" + temp.displayName;
  return "";
}
