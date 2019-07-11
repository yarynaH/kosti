var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var blogLib = require(libLocation + "blogLib");
var hashtagLib = require(libLocation + "hashtagLib");

exports.get = function(req) {
  var params = req.params;
  //params.q - search by article name
  //params.hid - search by hashtag id
  if (params.hid) {
    var query = hashtagLib.getHashtagName(params.hid);
    var searchRes = blogLib.getSearchArticles(params.hid, null, true);
    hashtagLib.hotHashtagCheck(params.hid, req.cookies.cartId);
  } else {
    var query = params.q;
    if (!query) query = "";
    var searchRes = blogLib.getSearchArticles(query, null, false);
  }

  var view = resolve("search.html");
  var site = portal.getSiteConfig();
  return {
    body: thymeleaf.render(view, {
      pageComponents: helpers.getPageComponents(req, "footerBlog"),
      sidebar: blogLib.getSidebar(),
      query: query,
      loadMoreComponent: helpers.getLoadMore(searchRes.total, null, null),
      loadMoreText: helpers.getRandomString(),
      searchRes: searchRes
    }),
    contentType: "text/html"
  };
};