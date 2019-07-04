var norseUtils = require("norseUtils");
var contentLib = require("/lib/xp/content");
var portalLib = require("/lib/xp/portal");
var nodeLib = require("/lib/xp/node");
var contextLib = require("/lib/contextLib");

exports.checkSpace = checkSpace;
exports.submitForm = submitForm;
exports.getForms = getForms;

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

function connectFormRepo() {
  return nodeLib.connect({
    repoId: "forms",
    branch: "master"
  });
}
