var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var norseUtils = require("norseUtils");
var mailLib = require("/lib/xp/mail");
var htmlExporter = require("/lib/openxp/html-exporter");
var ioLib = require("/lib/xp/io");
var qrLib = require("qrLib");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var newsletter = require("../pages/newsletter/newsletter");

var mailsTemplates = {
  orderCreated: "../pages/mails/orderCreated.html",
  userActivation: "../pages/mails/userActivation.html",
  forgotPass: "../pages/mails/forgotPass.html",
  newsletter: "../pages/mails/newsletter.html",
  orderShipped: "../pages/mails/orderShipped.html",
  pendingItem: "../pages/mails/pendingItem.html",
  regularTicket: "../pages/pdfs/regularTicket.html",
  legendaryTicket: "../pages/pdfs/legendaryTicket.html"
};

function sendMail(type, email, params) {
  var mail = null;
  switch (type) {
    case "orderCreated":
      mail = getorderCreatedMail(params);
      break;
    case "sendShippedMail":
      mail = getorderShippedMail(params);
      break;
    case "userActivation":
      mail = getActivationMail(email, params);
      break;
    case "forgotPass":
      mail = getForgotPassMail(email, params);
      break;
    case "newsletter":
      mail = sendNewsletter();
      return;
      break;
    case "pendingItem":
      mail = getPendingItemMail(params);
      break;
    default:
      break;
  }
  var sent = mailLib.send({
    from: mail.from,
    to: email,
    subject: mail.subject,
    body: mail.body,
    contentType: 'text/html; charset="UTF-8"',
    attachments: mail.attachments
  });
}

function prepareNewsletter() {
  var newsletterRepo = nodeLib.connect({
    repoId: "newsletter",
    branch: "master"
  });
  var nodes = newsletterRepo.query({
    start: 0,
    count: -1,
    query: "email != ''"
  });
  if (nodes.total < 1) {
    return false;
  }
  nodes = norseUtils.forceArray(nodes.hits);
  var emails = [];
  for (var i = 0; i < nodes.length; i++) {
    var tempEmail = newsletterRepo.get(nodes[i].id);
    emails.push({
      email: tempEmail.email,
      hash: tempEmail.subscriptionHash
    });
  }
  return emails;
}

function sendNewsletter(email) {
  var newsletterView = newsletter.renderView();
  var sent = mailLib.send({
    from: "noreply@kostirpg.com",
    to: ["maxskywalker94@gmail.com"],
    subject: newsletterView.displayName,
    body: newsletterView.body,
    contentType: 'text/html; charset="UTF-8"'
  });
}

function unsubscribe(hash) {
  var result = contextLib.runAsAdmin(function() {
    var newsletterRepo = nodeLib.connect({
      repoId: "newsletter",
      branch: "master"
    });
    var node = newsletterRepo.query({
      start: 0,
      count: 1,
      query: "subscriptionHash = '" + hash + "'"
    });
    if (node.total < 1) {
      return false;
    }
    newsletterRepo.delete(node.hits[0].id);
    return true;
  });
  return result;
}

function getorderCreatedMail(params) {
  var d = new Date();
  var dateString =
    d.getDate() +
    " " +
    norseUtils.getMonthName(d) +
    ", " +
    d.getFullYear() +
    ", " +
    d.getHours() +
    ":" +
    d.getMinutes();
  return {
    body: thymeleaf.render(resolve(mailsTemplates.orderCreated), {
      order: params.order,
      site: portal.getSite(),
      dateString: dateString,
      cart: params.cart
    }),
    subject: "Ваш заказ получен",
    from: "noreply@kostirpg.com",
    attachments: getTickets(params)
  };

  function getTickets(params) {
    var qrs = [];
    var typeNumber = 4;
    var errorCorrectionLevel = "L";
    for (var i = 0; i < params.cart.items.length; i++) {
      var item = contentLib.get({ key: params.cart.items[i]._id });
      if (item && item.data && item.data.type == "ticket") {
        for (var j = 0; j < params.cart.items[i].itemsIds.length; j++) {
          var qr = qrLib(typeNumber, errorCorrectionLevel);
          qr.addData(params.cart.items[i].itemsIds[j].id);
          qr.make();
          qrs.push({
            qr: qr.createTableTag(7, 0),
            type: item.data.ticketType
          });
        }
      }
    }
    var pdfs = [];
    for (var i = 0; i < qrs.length; i++) {
      var fileSource = htmlExporter.exportToPdf(
        thymeleaf.render(resolve(mailsTemplates[qrs[i].type]), {
          qrcode: qrs[i].qr
        })
      );
      fileSource.name = "ticket" + i + ".pdf";
      var stream = htmlExporter.getStream(fileSource);
      var tempData = {
        data: stream,
        mimeType: "application/pdf",
        headers: {
          "Content-Disposition":
            'attachment; filename="' + fileSource.name + '"'
        },
        fileName: fileSource.name
      };
      pdfs.push(tempData);
    }
    return pdfs;
  }
}

function getorderShippedMail(params) {
  var d = new Date();
  var dateString =
    d.getDate() +
    " " +
    norseUtils.getMonthName(d) +
    ", " +
    d.getFullYear() +
    ", " +
    d.getHours() +
    ":" +
    d.getMinutes();
  return {
    body: thymeleaf.render(resolve(mailsTemplates.orderShipped), {
      site: portal.getSite(),
      dateString: dateString,
      cart: params.cart
    }),
    subject: "Ваш заказ отправлен",
    from: "noreply@kostirpg.com"
  };
}

function getActivationMail(mail, params) {
  var activationUrl = portal.serviceUrl({
    service: "user",
    type: "absolute",
    params: {
      mail: encodeURI(mail),
      action: "confirmRegister",
      hash: params.activationHash
    }
  });
  return {
    body: thymeleaf.render(resolve(mailsTemplates.userActivation), {
      activationUrl: activationUrl,
      site: portal.getSite()
    }),
    subject: "Активация аккаунта",
    from: "noreply@kostirpg.com"
  };
}

function getForgotPassMail(mail, params) {
  var resetUrl = portal.serviceUrl({
    service: "user",
    type: "absolute",
    params: {
      action: "forgotPass",
      mail: encodeURI(mail),
      hash: params.forgotPassHash
    }
  });
  return {
    body: thymeleaf.render(resolve(mailsTemplates.forgotPass), {
      resetUrl: resetUrl,
      site: portal.getSite()
    }),
    subject: "Смена пароля",
    from: "noreply@kostirpg.com"
  };
}

function getPendingItemMail(params) {
  return {
    body: thymeleaf.render(resolve(mailsTemplates.pendingItem), {
      orderUrl: portal.serviceUrl({
        service: "orders",
        type: "absolute",
        params: {
          action: "details",
          id: params.id
        }
      }),
      site: portal.getSite()
    }),
    subject: "Новый заказ ожидание",
    from: "noreply@kostirpg.com"
  };
}

exports.sendMail = sendMail;
exports.unsubscribe = unsubscribe;
exports.prepareNewsletter = prepareNewsletter;
