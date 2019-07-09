var norseUtils = require("norseUtils");
var nodeLib = require("/lib/xp/node");
var portal = require("/lib/xp/portal");

exports.connectRepo = connectRepo;
exports.generateNiceServiceUrl = generateNiceServiceUrl;
exports.getTranslationCounter = getTranslationCounter;

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

function getTranslationCounter(count) {
  var stringCount = count.toString();
  if (
    stringCount === "11" ||
    (stringCount[stringCount.length - 1] === "1" &&
      stringCount[stringCount.length - 2] === "1")
  ) {
    return "3";
  }
  switch (stringCount[stringCount.length - 1]) {
    case "1":
      //* Комментарий
      return "1";
      break;
    case "2":
    case "3":
    case "4":
      //* Комментария
      return "2";
      break;
    default:
      //* Комментариев
      return "3";
      break;
  }
}
