const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");
const i18nLib = require("/lib/xp/i18n");

const libLocation = "../../lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const userLib = require(libLocation + "userLib");
const kostiUtils = require(libLocation + "kostiUtils");
const newsletterLib = require(libLocation + "newsletterLib");
const contextLib = require(libLocation + "contextLib");
const storeLib = require(libLocation + "storeLib");
const sharedLib = require(libLocation + "sharedLib");

exports.get = handleReq;

function handleReq(req) {
  var me = this;
  var user = userLib.getCurrentUser();

  function renderView() {
    var view = resolve("kosticonnect.html");
    var model = createModel();
    var body = thymeleaf.render(view, model);
    var jquery = portal.assetUrl({ path: "js/jquery-2.2.0.min.js" });
    var typeText = portal.assetUrl({ path: "js/jquery.animateTyping.js" });
    var fileName = portal.assetUrl({ path: "js/kosticonnect.js" });
    return {
      body: body,
      contentType: "text/html",
      pageContributions: {
        bodyEnd: [
          "<script src='" + fileName + "'></script>",
          "<script src='" + typeText + "'></script>"
        ]
      }
    };
  }

  function createModel() {
    var up = req.params;
    var content = portal.getContent();
    let products = null;
    if (content.data.products) {
      products = storeLib.getProductsByIds(
        content.data.products,
        req.remoteAddress
      );
    }
    if (content.data.program) {
      var programUrl = portal.attachmentUrl({
        name: content.data.program
      });
    } else {
      var programUrl = null;
    }

    var model = {
      products: products,
      content: content,
      programUrl: programUrl,
      faqArray: norseUtils.forceArray(content.data.faq),
      footerLinks: getFooterLinks(content),
      frontPageUrl: portal.pageUrl({ path: portal.getSite()._path }),
      relatedLocales: kostiUtils.getRelatedLocales(content),
      pageComponents: helpers.getPageComponents(req, "footerScripts")
    };

    return model;
  }

  function getFooterLinks(content) {
    var result = [];
    if (content.data.footer) {
      content.data.footer = norseUtils.forceArray(content.data.footer);
      for (var i = 0; i < content.data.footer.length; i++) {
        result.push({
          url: portal.pageUrl({ id: content.data.footer[i] }),
          displayName: contentLib.get({ key: content.data.footer[i] })
            .displayName
        });
      }
    }
    return result;
  }

  return renderView();
}
