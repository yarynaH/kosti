var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');

exports.checkSpace = checkSpace;
exports.submitForm = submitForm;

function submitForm( params ){
  contextLib.runAsAdmin(function () {
    var formNode = connectFormRepo();
    formNode.create( params );
  });
}

function checkSpace( params ){
  var formNode = connectFormRepo();
  var result = formNode.query({
    query: params.game + " = '" + params.name + "'"
  });
  return result.total;
}

function connectFormRepo(){
  return nodeLib.connect({
      repoId: "forms",
      branch: "master"
  });
}
