var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');

function submitForm( params ){
  var formNode = connectFormRepo();
  contextLib.runAsAdmin(function () {
    formNode.create( params );
  });
}

function connectFormRepo(){
  return nodeLib.connect({
      repoId: "forms",
      branch: "master"
  });
}
