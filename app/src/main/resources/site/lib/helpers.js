var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var userLib = require("userLib");
var authLib = require("/lib/xp/auth");
var cartLib = require("cartLib");
var nodeLib = require("/lib/xp/node");
var sharedLib = require("sharedLib");
var blogLib = require("blogLib");
var i18nLib = require("/lib/xp/i18n");

exports.fixPermissions = fixPermissions;
exports.getPageComponents = getPageComponents;
exports.getLoadMore = getLoadMore;
exports.getLoginRequest = getLoginRequest;

function getPageComponents(req, footerType, activeEl, title) {
  var pageComponents = {};
  if (req) {
    var up = req.params;
  } else {
    var up = {};
  }
  var site = sharedLib.getSite();
  var siteConfig = sharedLib.getSiteConfig();
  var content = portal.getContent();
  var user = userLib.getCurrentUser();

  var userServiceUrl = portal.serviceUrl({
    service: "user",
  });
  var contentServiceUrl = portal.serviceUrl({
    service: "content",
  });
  var cartServiceUrl = portal.serviceUrl({
    service: "cart",
  });
  var commentsServiceUrl = portal.serviceUrl({
    service: "comments",
  });
  var monsterServiceUrl = portal.serviceUrl({
    service: "monster",
  });

  var keywords = "";
  if (content) {
    keywords = getKeywords(content);
  }

  pageComponents["pagehead"] = thymeleaf.render(
    resolve("../pages/components/head.html"),
    {
      siteConfig: siteConfig,
      content: content,
      site: site,
      keywords: keywords,
    }
  );
  var discordUrl = "https://discordapp.com/api/oauth2/authorize?";
  discordUrl += "client_id=605493268326776853";
  discordUrl +=
    "&redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    "user/auth/discord";
  discordUrl += "&response_type=code";
  discordUrl += "&scope=email%20identify";
  var vkUrl =
    "https://oauth.vk.com/authorize?" +
    "client_id=7018935&scope=4194304&" +
    "redirect_uri=" +
    portal.pageUrl({ _path: site._path, type: "absolute" }) +
    "user/auth/vk" +
    "&v=5.102";
  pageComponents["loginRegisterModal"] = thymeleaf.render(
    resolve("../pages/components/loginRegisterModal.html"),
    { discordUrl: discordUrl, vkUrl: vkUrl, showForm: user ? false : true }
  );

  pageComponents["header"] = thymeleaf.render(
    resolve("../pages/components/header.html"),
    {
      menuItems: getMenuItems(),
      site: site,
      user: user,
      search: thymeleaf.render(
        resolve("../pages/components/header/search.html"),
        {
          searchUrl: sharedLib.generateNiceServiceUrl("search"),
          active: activeEl === "search" ? "active" : "",
        }
      ),
      headerUser: thymeleaf.render(
        resolve("../pages/components/header/headerUser.html"),
        {
          user: user,
          active:
            content && content._path.indexOf("/users/") === -1 ? "" : "active",
        }
      ),
    }
  );

  if (!footerType) footerType = "footer";
  pageComponents["footer"] =
    thymeleaf.render(
      resolve("../pages/components/footers/" + footerType + ".html"),
      {
        footerLinks: getFooterLinks(),
      }
    ) +
    thymeleaf.render(
      resolve("../pages/components/footers/footerScripts.html"),
      {
        userServiceUrl: userServiceUrl,
        contentServiceUrl: contentServiceUrl,
        cartServiceUrl: cartServiceUrl,
        commentsServiceUrl: commentsServiceUrl,
        monsterServiceUrl: monsterServiceUrl,
        cartId: cartLib.getCart(req && req.cookies ? req.cookies.cartId : null)
          ._id,
      }
    );

  function getFooterLinks() {
    var result = [];
    if (!siteConfig.agreements) {
      return [];
    }
    siteConfig.agreements = norseUtils.forceArray(siteConfig.agreements);
    for (var i = 0; i < siteConfig.agreements.length; i++) {
      if (siteConfig.agreements[i]) {
        var agreement = contentLib.get({ key: siteConfig.agreements[i] });
        result.push({
          url: portal.pageUrl({ id: siteConfig.agreements[i] }),
          displayName: agreement.displayName,
        });
      }
    }
    return result;
  }

  function getMenuItems() {
    var result = [];
    if (siteConfig.menuItems) {
      var items = norseUtils.forceArray(siteConfig.menuItems);
      for (var i = 0; i < items.length; i++) {
        var tempContent = contentLib.get({ key: items[i] });
        result.push({
          url: portal.pageUrl({ path: tempContent._path }),
          title: tempContent.displayName,
          active: content && content._path.indexOf(tempContent._path) !== -1,
        });
      }
    }
    return result;
  }

  return pageComponents;
}

function getLoadMore(params) {
  if (!params) {
    params = {};
  }
  if (params.hideIfNone !== true) {
    params.hideIfNone = false;
  }
  if (params.articlesCount === null || params.articlesCount === undefined) {
    params.articlesCount = 11;
  }
  if (!params.noMoreTitle) {
    params.noMoreTitle = "articles";
  }
  if (!params.pageSize) {
    params.pageSize = 10;
  }
  return thymeleaf.render(resolve("../pages/components/blog/loadMore.html"), {
    articlesCount: params.articlesCount,
    noMoreTitle: params.noMoreTitle,
    hideIfNone: params.hideIfNone,
    pageSize: params.pageSize,
  });
}

function fixPermissions(repo, role) {
  if (!role) {
    role = "role:system.authenticated";
  }
  var repoConn = sharedLib.connectRepo(repo);
  repoConn.setRootPermissions({
    _permissions: [
      {
        principal: role,
        allow: [
          "READ",
          "CREATE",
          "MODIFY",
          "DELETE",
          "PUBLISH",
          "READ_PERMISSIONS",
          "WRITE_PERMISSIONS",
        ],
        deny: [],
      },
    ],
    _inheritsPermissions: true,
  });
}

function getLoginRequest() {
  return {
    body: thymeleaf.render(
      resolve("../pages/components/user/loginError.html"),
      {
        pageComponents: getPageComponents(),
      }
    ),
    contentType: "text/html",
  };
}

function getKeywords(content) {
  var keywords = "";
  var hashtags = null;
  if (content.data && content.data.hashtags) {
    hashtags = norseUtils.forceArray(content.data.hashtags);
  } else if (content.type === "portal:site") {
    hashtags = norseUtils.forceArray(portal.getSiteConfig().hashtags);
  } else {
    hashtags = [];
  }
  for (var i = 0; i < hashtags.length; i++) {
    var hashtag = contentLib.get({ key: hashtags[i] });
    if (hashtag) {
      if (keywords !== "") {
        keywords += ", ";
      }
      if (hashtag.data.keywords) {
        hashtag.data.keywords = norseUtils.forceArray(hashtag.data.keywords);
        keywords +=
          hashtag.displayName + ", " + hashtag.data.keywords.join(", ");
      } else {
        keywords += hashtag.displayName;
      }
    }
  }
  if (keywords === "") {
    return content.displayName;
  } else {
    return keywords;
  }
}
