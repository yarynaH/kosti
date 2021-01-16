const thymeleaf = require("/lib/thymeleaf");
const portal = require("/lib/xp/portal");
const contentLib = require("/lib/xp/content");

const libLocation = "../../site/lib/";
const norseUtils = require(libLocation + "norseUtils");
const contextLib = require(libLocation + "contextLib");
const helpers = require(libLocation + "helpers");

exports.get = function (req) {
  var bot = getBot();
  return {
    body: thymeleaf.render(resolve("discordbot.html"), {
      text: bot.data.welcomeText,
      pageComponents: helpers.getPageComponents(req)
    }),
    contentType: "text/html"
  };
};

exports.post = function (req) {
  var bot = getBot();
  bot = contextLib.runInDraftAsAdmin(function () {
    return editBot(bot, req.params);
  });
  return {
    body: thymeleaf.render(resolve("discordbot.html"), {
      text: bot.data.welcomeText,
      pageComponents: helpers.getPageComponents(req)
    }),
    contentType: "text/html"
  };
};

function getBot() {
  var site = portal.getSiteConfig();
  return contentLib.get({ key: site.discordBot });
}

function editBot(bot, data) {
  bot = contentLib.modify({
    key: bot._id,
    editor: editor
  });
  contentLib.publish({
    keys: [bot._id],
    sourceBranch: "draft",
    targetBranch: "master"
  });
  return bot;
  function editor(c) {
    c.data = data;
    return c;
  }
}
