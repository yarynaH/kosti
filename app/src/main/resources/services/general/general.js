const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const helpers = require(libLocation + "helpers");
const votesLib = require(libLocation + "votesLib");
const cartLib = require(libLocation + "cartLib");
const storeLib = require(libLocation + "storeLib");
const blogLib = require(libLocation + "blogLib");
const homepageLib = require(libLocation + "homepageLib");
const newsletterLib = require(libLocation + "newsletterLib");

exports.get = function (req) {
  var params = req.params;
  switch (params.action) {
    case "fixPermissions":
      helpers.fixPermissions(params.repo);
      break;
    case "fixVotesTimestamps":
      votesLib.fixVotesTimestamps();
      break;
    case "fixCartDate":
      cartLib.fixCartDate();
      break;
    case "fixCartPrice":
      cartLib.fixCartPrice(params.force);
      break;
    case "fixItemIds":
      cartLib.fixItemIds();
      break;
    case "getEmailsFromNewsletter":
      var emails = newsletterLib.getSubscribedEmails();
      norseUtils.log(emails);
      break;
    case "removeUnusedVotes":
      votesLib.removeUnusedVotes();
      break;
    case "fixPendingOrders":
      storeLib.checkLiqpayOrderStatus();
      break;
    case "updateSchedule":
      blogLib.updateSchedule();
      break;
    case "updateCache":
      homepageLib.updateCache();
      break;
  }
  return {
    body: "",
    contentType: "text/html"
  };
};
