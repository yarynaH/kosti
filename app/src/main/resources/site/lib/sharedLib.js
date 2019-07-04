var norseUtils = require("norseUtils");
var nodeLib = require("/lib/xp/node");
var portal = require("/lib/xp/portal");

exports.connectRepo = connectRepo;
exports.generateNiceServiceUrl = generateNiceServiceUrl;

function connectRepo(id) {
  return nodeLib.connect({
    repoId: id,
    branch: "master"
  });
}

function generateNiceServiceUrl(url, params) {
  var site = portal.getSite();
  if (url && url.indexOf("/") !== 0) {
    url = "/" + url;
  }
  return portal.pageUrl({ path: site._path + url, params: params });
}
