var norseUtils = require("norseUtils");
var userLib = require("userLib");
var cartLib = require("cartLib");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var helpers = require("helpers");
var thymeleaf = require("/lib/thymeleaf");
var nodeLib = require("/lib/xp/node");
var contextLib = require("/lib/contextLib");
var qrLib = require("qrLib");
var hashLib = require("hashLib");
var htmlExporter = require("/lib/openxp/html-exporter");
var textEncodingLib = require("/lib/text-encoding");
var mailsLib = require("mailsLib");

exports.get = function(req) {
  var params = req.params;
  switch (params.action) {
    case "testOrderMail":
      var result = false;
      var view = resolve("../../pages/mails/orderCreated.html");
      var site = portal.getSiteConfig();
      var shopUrl = portal.pageUrl({
        id: site.shopLocation
      });
      return {
        body: thymeleaf.render(view, {
          cart: cartLib.getCart(req.cookies.cartId),
          site: portal.getSite()
        }),
        contentType: "text/html"
      };
    case "pdfPage":
      var typeNumber = 4;
      var errorCorrectionLevel = "L";
      var qr = qrLib(typeNumber, errorCorrectionLevel);
      qr.addData("Hi! Its me, Max!");
      qr.make();
      var code = qr.createTableTag(7, 0);
      return {
        body: thymeleaf.render(resolve("../../pages/pdfs/regularTicket.html"), {
          qrcode: code
        }),
        contentType: "text/html"
      };
    case "pdfPageFile":
      var typeNumber = 4;
      var errorCorrectionLevel = "L";
      var qr = qrLib(typeNumber, errorCorrectionLevel);
      qr.addData(params.hash);
      qr.make();
      var code = qr.createTableTag(7, 0);
      return {
        body: getStream(
          htmlExporter.exportToPdf(
            thymeleaf.render(resolve("../../pages/pdfs/legendaryTicket.html"), {
              qrcode: code
            })
          )
        ),
        headers: {
          "Content-Disposition": 'attachment; filename="test.pdf"'
        }
      };
    case "checkSubscription":
      mailsLib.prepareNewsletter();
      break;
    case "importUsersToNode":
      var site = portal.getSiteConfig();
      var emails = contentLib.get({ key: site.mailsLocation });
      emails = emails.data.mail;
      var newsletterRepo = nodeLib.connect({
        repoId: "newsletter",
        branch: "master"
      });
      for (var i = 0; i < emails.length; i++) {
        var created = newsletterRepo.query({
          start: 0,
          count: 1,
          query: "email = '" + emails[i] + "'"
        });
        if (created.total > 0) {
          continue;
        }
        newsletterRepo.create({
          email: emails[i],
          subscriptionHash: hashLib.generateHash(emails[i])
        });
      }
      for (var i = 0; i < surveyEmails.length; i++) {
        var created = newsletterRepo.query({
          start: 0,
          count: 1,
          query: "email = '" + surveyEmails[i] + "'"
        });
        if (created.total > 0) {
          continue;
        }
        newsletterRepo.create({
          email: surveyEmails[i],
          subscriptionHash: hashLib.generateHash(surveyEmails[i])
        });
      }
      break;
  }

  function getStream(fileSource, charsetDecode, encoding) {
    var stream = textEncodingLib.base64Decode(fileSource.content);

    if (encoding == undefined) {
      encoding = "UTF-8";
    }

    if (charsetDecode != undefined && charsetDecode === true) {
      stream = textEncodingLib.charsetDecode(stream, encoding);
    }

    return stream;
  }
};
