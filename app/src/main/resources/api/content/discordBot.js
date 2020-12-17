const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");

exports.get = function (req) {
  var bot = getBot();
  return {
    body: bot.data,
    contentType: "application/json"
  };
};

function getBot() {
  var site = portal.getSiteConfig();
  return contentLib.get({ key: site.discordBot });
}
