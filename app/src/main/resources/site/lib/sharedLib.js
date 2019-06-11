var norseUtils = require('norseUtils');
var nodeLib = require('/lib/xp/node');

exports.connectRepo = connectRepo;

function connectRepo(id){
  return nodeLib.connect({
      repoId: id,
      branch: "master"
  });
}