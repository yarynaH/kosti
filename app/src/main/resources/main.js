var event = require("/lib/xp/event");
var content = require("/lib/xp/content");
var contentLib = require("/lib/xp/content");

var libLocation = "site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var votesLib = require(libLocation + "votesLib");
var contextLib = require(libLocation + "contextLib");
var blogLib = require(libLocation + "blogLib");
var socNotLib = require(libLocation + "socialNotificationLib");

// catch events
event.listener({
  type: "node.created",
  localOnly: false,
  callback: function (e) {
    if (e.data && e.data.nodes) {
      var nodes = parseNodes(e.data.nodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = content.get({ key: nodes[0].id });
        if (node) {
          contextLib.runAsAdmin(function () {
            votesLib.createBlankVote(node._id);
          });
        }
      }
    }
    return true;
  }
});

// catch events
event.listener({
  type: "node.pushed",
  localOnly: false,
  callback: function (e) {
    if (e.data && e.data.nodes) {
      var nodes = parseNodes(e.data.nodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = content.get({ key: nodes[0].id });
        var vote = votesLib.getNode(node._id);
        if (!vote) {
          vote = votesLib.createBlankVote(node._id, "article");
        }
        votesLib.setVoteDate(vote._id, node.publish.from);
        if (node && node.type && node.type == app.name + ":article") {
          if (!vote.notified) {
            node.url = pageUrl(node);
            if (app.config.discordKotirpgChannel) {
              var discordMessage = blogLib.generateDiscordNotificationMessage(
                node
              );
              socNotLib.sendDiscordMessage({
                webhookUrl: app.config.discordKotirpgChannel,
                body: discordMessage
              });
            }
            if (
              app.config.telegramNotificationChat &&
              app.config.telegramBotToken
            ) {
              var telegramMessage = blogLib.generateTelegramNotificationMessage(
                node
              );
              socNotLib.sendTelegramMessage({
                body: telegramMessage,
                chatId: app.config.telegramNotificationChat,
                botId: app.config.telegramBotToken,
                hidePreview: true
              });
            }
            votesLib.markVoteAsNotified(node._id);
          }
        }
      }
    }
    return true;
  }
});

event.listener({
  type: "node.deleted",
  localOnly: false,
  callback: function (e) {
    if (e.data && e.data.nodes) {
      var nodes = parseNodes(e.data.nodes);
      for (var i = 0; i < nodes.length; i++) {
        votesLib.removeVoteByItemId(nodes[0].id);
      }
    }
    return true;
  }
});

function parseNodes(nodes) {
  if (typeof nodes != "string") {
    return nodes;
  }
  var regexp = new RegExp("{([^}]+)}", "g");
  var nodes = nodes.match(regexp);
  var nodesArray = [];

  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i].replace("{", "").replace("}", "");
    var attributes = node.split(",");
    var obj = {};
    for (var j = 0; j < attributes.length; j++) {
      var attr = attributes[j].trim().split("=");
      obj["" + attr[0]] = attr[1];
    }
    nodesArray.push(obj);
  }

  return nodesArray;
}

function pageUrl(object) {
  var baseUrl = app.config["base.url"];
  var site = contentLib.getSite({ key: object._id });
  if (site) {
    return baseUrl + object._path.substring(site._path.length);
  }
  return null;
}
