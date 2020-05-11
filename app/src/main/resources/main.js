var event = require("/lib/xp/event");
var content = require("/lib/xp/content");
var slackLib = require("/lib/slackLib");
var telegramLib = require("/lib/telegramLib");
var discordLib = require("/lib/discordLib");
var contentLib = require("/lib/xp/content");

var libLocation = "site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var votesLib = require(libLocation + "votesLib");
var contextLib = require(libLocation + "contextLib");
var blogLib = require(libLocation + "blogLib");

// catch events
event.listener({
  type: "node.created",
  localOnly: false,
  callback: function (e) {
    if (e.data && e.data.nodes) {
      var nodes = parseNodes(e.data.nodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = content.get({ key: nodes[0].id });
        if (node && node.type && node.type == app.name + ":article") {
          contextLib.runAsAdmin(function () {
            votesLib.createBlankVote(node._id, "article");
          });
        } else if (node && node.type && node.type == app.name + ":hashtag") {
          contextLib.runAsAdmin(function () {
            votesLib.createBlankVote(node._id, "hashtag");
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
        if (node && node.type && node.type == app.name + ":article") {
          var vote = votesLib.getNode(node._id);
          if (!vote) {
            vote = votesLib.createBlankVote(node._id, "article");
          }
          votesLib.setVoteDate(vote._id, node.publish.from);
          if (!vote.notified) {
            node.url = pageUrl(node);
            discordLib.sendMessage({
              webhookUrl: app.config.discordKotirpgChannel,
              body: blogLib.generateDiscordNotificationMessage(node)
            });
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
