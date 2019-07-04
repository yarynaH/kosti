var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var userLib = require("userLib");
var authLib = require("/lib/xp/auth");
var cartLib = require("cartLib");
var nodeLib = require("/lib/xp/node");
var sharedLib = require("sharedLib");

exports.fixPermissions = fixPermissions;

exports.getPageComponents = function(req, footerType) {
  var pageComponents = {};
  if (req) {
    var up = req.params;
  } else {
    var up = {};
  }
  var site = portal.getSite();
  var siteConfig = portal.getSiteConfig();
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
  if (content && content.data && content.data.shortIntro) {
    var ogDescription = content.data.shortIntro.replace(
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

  pageComponents["pagehead"] = thymeleaf.render(
    resolve("../pages/components/head.html"),
    {
      siteConfig: siteConfig,
      content: content,
      ogImage: ogImage,
      site: site,
      ogDescription: ogDescription
    }
  );

  pageComponents["loginRegisterModal"] = thymeleaf.render(
    resolve("../pages/components/loginRegisterModal.html"),
    {}
  );

  pageComponents["header"] = thymeleaf.render(
    resolve("../pages/components/header.html"),
    {
      menuItems: getMenuItems(),
      site: site,
      searchUrl: sharedLib.generateNiceServiceUrl("search"),
      user: userLib.getCurrentUser(),
      headerUser: thymeleaf.render(
        resolve("../pages/components/headerUser.html"),
        { user: userLib.getCurrentUser() }
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
        cartId: cartLib.getCart(req && req.cookies ? req.cookies.cartId : null)
          ._id
      }
    );

  function getFooterLinks() {
    var result = {};
    if (siteConfig.agreementPage) {
      result.agreementPage = portal.pageUrl({ id: siteConfig.agreementPage });
    }
    if (siteConfig.coockiePolicy) {
      result.coockiePolicy = portal.pageUrl({ id: siteConfig.coockiePolicy });
    }
    if (siteConfig.aboutUs) {
      result.aboutUs = portal.pageUrl({ id: siteConfig.aboutUs });
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
          url: portal.pageUrl({ id: items[i] }),
          title: tempContent.displayName,
          active: content && tempContent._path === content._path
        });
      }
    }
    return result;
  }

  return pageComponents;
};

function checkUser() {
  var user = userLib.getCurrUser();
  var result = {};
  if (user) {
    result.user = user;
  }
  return result;
}

function fixPermissions(repo, role) {
  if (!role) {
    role = "role:system.authenticated";
  }
  var repoConn = connectRepo(repo);
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
