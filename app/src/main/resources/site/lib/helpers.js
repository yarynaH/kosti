var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var userLib = require("userLib");
var authLib = require("/lib/xp/auth");
var cartLib = require("cartLib");
var nodeLib = require("/lib/xp/node");
var sharedLib = require("sharedLib");
var i18nLib = require("/lib/xp/i18n");

exports.fixPermissions = fixPermissions;
exports.getPageComponents = getPageComponents;
exports.getLoadMore = getLoadMore;
exports.getRandomString = getRandomString;
exports.getLoginRequest = getLoginRequest;
exports.getSelectComponent = getSelectComponent;

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

  var userServiceUrl = portal.serviceUrl({
    service: "user"
  });
  var contentServiceUrl = portal.serviceUrl({
    service: "content"
  });
  var cartServiceUrl = portal.serviceUrl({
    service: "cart"
  });
  var commentsServiceUrl = portal.serviceUrl({
    service: "comments"
  });
  var monsterServiceUrl = portal.serviceUrl({
    service: "monster"
  });

  if (content && content.data && content.data.mainImage) {
    var ogImage = portal.imageUrl({
      id: content.data.mainImage,
      scale: "(1,1)",
      type: "absolute"
    });
  } else if (content && content.data && content.data.image) {
    var ogImage = portal.imageUrl({
      id: content.data.image,
      scale: "(1,1)",
      type: "absolute"
    });
  } else {
    var ogImage = portal.assetUrl({
      path: "images/extended-logo-min.png",
      type: "absolute"
    });
  }
  if (content && content.data && content.data.intro) {
    var ogDescription = content.data.intro.replace(
      /(&nbsp;|(<([^>]+)>))/gi,
      ""
    );
  } else if (content && content.data && content.data.description) {
    var ogDescription = content.data.description.replace(
      /(&nbsp;|(<([^>]+)>))/gi,
      ""
    );
  } else {
    var ogDescription = site.data.description;
  }

  if (title) {
    title = title + " | " + site.displayName;
  } else {
    if (content && content.displayName !== site.displayName) {
      var title = content.displayName + " | " + site.displayName;
    } else {
      var title = site.displayName;
    }
  }

  pageComponents["pagehead"] = thymeleaf.render(
    resolve("../pages/components/head.html"),
    {
      siteConfig: siteConfig,
      content: content,
      ogImage: ogImage,
      site: site,
      title: title,
      ogDescription: ogDescription
    }
  );
  var discordUrl = "https://discordapp.com/api/oauth2/authorize?";
  discordUrl += "client_id=605493268326776853";
  discordUrl +=
    "&redirect_uri=" + portal.serviceUrl({ service: "user", type: "absolute" });
  discordUrl += "&response_type=code";
  discordUrl += "&scope=email%20identify";
  var vkUrl =
    "https://oauth.vk.com/authorize?" +
    "client_id=7018935&scope=4194304&" +
    "redirect_uri=" +
    portal.serviceUrl({ service: "vklogin", type: "absolute" }) +
    "&v=5.102";
  pageComponents["loginRegisterModal"] = thymeleaf.render(
    resolve("../pages/components/loginRegisterModal.html"),
    { discordUrl: discordUrl, vkUrl: vkUrl }
  );

  pageComponents["header"] = thymeleaf.render(
    resolve("../pages/components/header.html"),
    {
      menuItems: getMenuItems(),
      site: site,
      user: userLib.getCurrentUser(),
      search: thymeleaf.render(
        resolve("../pages/components/header/search.html"),
        {
          searchUrl: sharedLib.generateNiceServiceUrl("search"),
          active: activeEl === "search" ? "active" : ""
        }
      ),
      headerUser: thymeleaf.render(
        resolve("../pages/components/header/headerUser.html"),
        {
          user: userLib.getCurrentUser(),
          active:
            content && content._path.indexOf("/users/") === -1 ? "" : "active"
        }
      )
    }
  );

  if (!footerType) footerType = "footer";
  pageComponents["footer"] =
    thymeleaf.render(
      resolve("../pages/components/footers/" + footerType + ".html"),
      {
        footerLinks: getFooterLinks()
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
          ._id
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
          displayName: agreement.displayName
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
          active: content && content._path.indexOf(tempContent._path) !== -1
        });
      }
    }
    return result;
  }

  return pageComponents;
}

function checkUser() {
  var user = userLib.getCurrUser();
  var result = {};
  if (user) {
    result.user = user;
  }
  return result;
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
  if (!params.loadMoreText) {
    params.loadMoreText = getRandomString();
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
    loadMoreText: params.loadMoreText,
    hideIfNone: params.hideIfNone,
    pageSize: params.pageSize
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
          "WRITE_PERMISSIONS"
        ],
        deny: []
      }
    ],
    _inheritsPermissions: true
  });
}

function getRandomString() {
  var min = 1;
  var max = 11;
  //maximum not including
  var randomNumber = Math.floor(Math.random() * (max - min)) + min;
  return i18nLib.localize({
    key: "blog.loadMoreText." + randomNumber
  });
}

function getLoginRequest() {
  return {
    body: thymeleaf.render(
      resolve("../pages/components/user/loginError.html"),
      {
        pageComponents: getPageComponents()
      }
    ),
    contentType: "text/html"
  };
}

function getSelectComponent(params) {
  var view = resolve("../pages/components/form/select.html");
  return thymeleaf.render(view, params);
}
