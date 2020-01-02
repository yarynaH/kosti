var norseUtils = require("norseUtils");
var nodeLib = require("/lib/xp/node");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");

exports.connectRepo = connectRepo;
exports.generateNiceServiceUrl = generateNiceServiceUrl;
exports.getTranslationCounter = getTranslationCounter;
exports.getSite = getSite;
exports.getSiteConfig = getSiteConfig;
exports.getShopUrl = getShopUrl;

function connectRepo(id) {
  return nodeLib.connect({
    repoId: id,
    branch: "master"
  });
}

function getShopUrl() {
  var site = portal.getSiteConfig();
  return portal.pageUrl({
    id: site.shopLocation
  });
}

function getSite() {
  var site = portal.getSite();
  if (!site) {
    site = contentLib.query({ query: "_path = '/content/kosti'" }).hits[0];
  }
  return site;
}

function getSiteConfig() {
  var site = portal.getSiteConfig();
  if (!site) {
    site = contentLib.query({ query: "_path = '/content/kosti'" }).hits[0].data;
    for (var key in site.siteConfig) {
      if (site.siteConfig[key].applicationKey == app.name) {
        site = site.siteConfig[key].config;
        break;
      }
    }
  }
  return site;
}

function generateNiceServiceUrl(url, params, absolute) {
  var type = absolute ? "absolute" : "server";
  var site = getSite();
  if (url && url.indexOf("/") !== 0) {
    url = "/" + url;
  }
  return portal.pageUrl({
    path: site._path + url,
    params: params,
    type: type
  });
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
