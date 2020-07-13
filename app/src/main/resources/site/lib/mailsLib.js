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
var sharedLib = require("sharedLib");
var pdfLib = require("pdfLib");

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

var components = {
  head: "../pages/mails/components/head.html",
  header: "../pages/mails/components/header.html",
  footer: "../pages/mails/components/footer.html"
};

exports.sendMail = sendMail;
exports.unsubscribe = unsubscribe;
exports.getMailComponents = getMailComponents;

function getMailComponents(params) {
  if (!params) {
    params = {};
  }
  if (!params.title) {
    params.title = "";
  }
  var site = sharedLib.getSite();
  return {
    head: thymeleaf.render(resolve(components.head), { title: params.title }),
    header: thymeleaf.render(resolve(components.header), { site: site }),
    footer: thymeleaf.render(resolve(components.footer), {})
  };
}

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
      mail = getNewsletter(params);
      email = mail.to;
      break;
    case "pendingItem":
      mail = getPendingItemMail(params);
      break;
    default:
      break;
  }
  email = norseUtils.forceArray(email);
  for (var i = 0; i < email.length; i++) {
    mailLib.send({
      from: mail.from ? mail.from : "Vecherniye Kosti <noreply@kostirpg.com>",
      to: [email[i]],
      subject: mail.subject,
      body: mail.body,
      replyTo: "Vecherniye Kosti <info@kostirpg.com>",
      contentType: 'text/html; charset="UTF-8"',
      attachments: mail.attachments,
      headers: {
        "MIME-Version": "1.0"
      }
    });
  }
}

function getSubscribersMailingList() {
  var repo = sharedLib.connectRepo("newsletter");
  var result = [];
  var emails = repo.query({
    query: "subscribed = 'true'",
    count: -1
  });
  return validateEmailList(repo, emails);
}

function getCustomersMailingList() {
  var repo = sharedLib.connectRepo("cart");
  var result = [];
  var emails = repo.query({
    count: -1,
    filters: {
      boolean: {
        must: [
          {
            exists: {
              field: "email"
            }
          }
        ]
      }
    }
  });
  return validateEmailList(repo, emails);
}

function validateEmailList(repo, emails) {
  var result = [];
  for (var i = 0; i < emails.hits.length; i++) {
    var email = repo.get(emails.hits[i].id);
    if (norseUtils.validateEmail(email.email)) {
      result.push(email.email);
    }
  }
  return norseUtils.uniqueArray(result);
}

function getNewsletter(params) {
  var customers = params.mailLists.customers ? getCustomersMailingList() : [];
  var subscribers = params.mailLists.subscribers
    ? getSubscribersMailingList()
    : [];
  var mails = norseUtils.uniqueArray(customers.concat(subscribers));
  return {
    to: mails,
    subject: params.displayName,
    body: params.body,
    contentType: 'text/html; charset="UTF-8"',
    attachments: null
  };
}

function unsubscribe(hash) {
  var result = contextLib.runAsAdmin(function () {
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
  var d = new Date(params.cart.transactionDate);
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
      site: sharedLib.getSite(),
      dateString: dateString,
      cart: params.cart,
      mailComponents: getMailComponents({
        title: "Ваш заказ получен"
      }),
      specialText:
        params.cart.country === "ru" && params.cart.shipping === "digital"
          ? true
          : false
    }),
    subject: "Ваш заказ получен",
    attachments: getTickets(params)
  };

  function getTickets(params) {
    var pdfs = [];
    for (var i = 0; i < params.cart.items.length; i++) {
      var item = contentLib.get({ key: params.cart.items[i]._id });
      if (item && item.data && item.data.type == "ticket") {
        for (var j = 0; j < params.cart.items[i].itemsIds.length; j++) {
          var name = "ticket" + i + j + ".pdf";
          pdfs.push({
            data: pdfLib.generatePdf({
              template: item.data.ticketType,
              qrData: params.cart.items[i].itemsIds[j].id,
              type: "ticket",
              name: name,
              friendlyId: params.cart.items[i].itemsIds[j].friendlyId
            }),
            mimeType: "application/pdf",
            headers: {
              "Content-Disposition": 'attachment; filename="' + name + '"'
            },
            fileName: name
          });
        }
      }
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
      site: sharedLib.getSite(),
      dateString: dateString,
      mailComponents: getMailComponents({
        title: "Ваш заказ отправлен"
      }),
      cart: params.cart
    }),
    subject: "Ваш заказ отправлен"
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
      mailComponents: getMailComponents({
        title: "Активация аккаунта"
      }),
      site: sharedLib.getSite()
    }),
    subject: "Активация аккаунта"
  };
}

function getForgotPassMail(mail, params) {
  var resetUrl = portal.serviceUrl({
    service: "user",
    type: "absolute",
    params: {
      action: "forgotPass",
      email: encodeURI(mail),
      hash: params.forgotPassHash
    }
  });
  return {
    body: thymeleaf.render(resolve(mailsTemplates.forgotPass), {
      resetUrl: resetUrl,
      site: sharedLib.getSite(),
      mailComponents: getMailComponents({ title: "Смена пароля" })
    }),
    subject: "Смена пароля"
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
      mailComponents: getMailComponents({
        title: "Заказ в статусе ожидания"
      }),
      site: sharedLib.getSite()
    }),
    subject: "Новый заказ ожидание"
  };
}
