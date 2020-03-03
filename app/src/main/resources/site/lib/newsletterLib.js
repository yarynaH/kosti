var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");

var norseUtils = require("norseUtils");
var sharedLib = require("sharedLib");
var sharedLib = require("sharedLib");
var contextLib = require("contextLib");

exports.addEmailToNewsletter = addEmailToNewsletter;

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
