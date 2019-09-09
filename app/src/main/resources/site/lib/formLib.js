var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("contextLib");
var userLib = require("userLib");

exports.checkSpace = checkSpace;
exports.submitForm = submitForm;
exports.getForms = getForms;
exports.checkUserRegistered = checkUserRegistered;
exports.prepareEvents = prepareEvents;

function submitForm(params) {
  contextLib.runAsAdmin(function() {
    var formNode = connectFormRepo();
    formNode.create(params);
  });
}

function checkSpace(params) {
  var result;
  contextLib.runAsAdmin(function() {
    var formNode = connectFormRepo();
    result = formNode.query({
      query: params.game + " = '" + params.name + "'"
    });
  });
  return result.total;
}

function getForms(formType) {
  var result = [];
  contextLib.runAsAdmin(function() {
    var formNode = connectFormRepo();
    var hits = formNode.query({
      query: "formType = '" + formType + "'",
      count: -1
    }).hits;
    for (var i = 0; i < hits.length; i++) {
      result.push(formNode.get(hits[i].id));
    }
  });
  return result;
}

function checkUserRegistered() {
  var user = userLib.getCurrentUser();
  var content = portalLib.getContent();
  content.data.eventsBlock = norseUtils.forceArray(content.data.eventsBlock);
  for (var j = 0; j < content.data.eventsBlock.length; j++) {
    content.data.eventsBlock[j].events = norseUtils.forceArray(
      content.data.eventsBlock[j].events
    );
    for (var i = 0; i < content.data.eventsBlock[j].events.length; i++) {
      if (content.data.eventsBlock[j].events[i].users) {
        content.data.eventsBlock[j].events[i].users = norseUtils.forceArray(
          content.data.eventsBlock[j].events[i].users
        );
        for (
          var k = 0;
          k < content.data.eventsBlock[j].events[i].users.length;
          k++
        ) {
          if (
            user._id === content.data.eventsBlock[j].events[i].users[k].user
          ) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function prepareEvents(events) {
  if (!events) {
    return [];
  }
  events = norseUtils.forceArray(events);
  for (var i = 0; i < events.length; i++) {
    if (!events[i].users) {
      events[i].users = [];
    }
    events[i].users = norseUtils.forceArray(events[i].users);
    events[i].available = parseInt(events[i].maxSpace) > events[i].users.length;
  }
  return events;
}
