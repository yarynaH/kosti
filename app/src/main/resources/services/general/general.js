var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var votesLib = require(libLocation + "votesLib");
var cartLib = require(libLocation + "cartLib");
var storeLib = require(libLocation + "storeLib");
var newsletterLib = require(libLocation + "newsletterLib");

exports.get = function(req) {
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
  }
  return {
    body: "",
    contentType: "text/html"
  };
};
