var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");

var norseUtils = require("norseUtils");
var sharedLib = require("sharedLib");
var sharedLib = require("sharedLib");
var contextLib = require("contextLib");

exports.addEmailToNewsletter = addEmailToNewsletter;
exports.getSubscribedEmails = getSubscribedEmails;

function getSubscribedEmails() {
  var result = [];
  var repo = sharedLib.connectRepo("newsletter");
  var tempItems = repo.query({
    start: 0,
    count: -1
  });
  for (var i = 0; i < tempItems.hits.length; i++) {
    var item = repo.get(tempItems.hits[i].id);
    if (item.email) {
      result.push(item.email);
    }
  }
  var users = contentLib.query({
    start: 0,
    count: -1,
    contentTypes: [app.name + ":user"]
  });
  for (var i = 0; i < users.hits.length; i++) {
    if (users.hits[i].data.email) {
      if (result.indexOf(users.hits[i].data.email === -1)) {
        result.push(users.hits[i].data.email);
      }
    }
  }
  return result;
}

function addEmailToNewsletter(email) {
  var result = null;
  if (!checkIfEmailExists(email)) {
    var repo = sharedLib.connectRepo("newsletter");
    result = repo.create({
      email: email,
      subscribed: true
    });
  } else {
    result = true;
  }
  return result;
}

function checkIfEmailExists(email) {
  var repo = sharedLib.connectRepo("newsletter");
  var email = repo.query({
    start: 0,
    count: 1,
    query: "email = '" + email + "'"
  });
  if (email.total === 1) {
    return repo.get(email.hits[0].id);
  }
  return false;
}
