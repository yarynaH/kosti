var norseUtils = require("norseUtils");
var nodeLib = require("/lib/xp/node");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var repoLib = require("/lib/xp/repo");
var contextLib = require("contextLib");

exports.connectRepo = getRepoConnection;
exports.generateNiceServiceUrl = generateNiceServiceUrl;
exports.getTranslationCounter = getTranslationCounter;
exports.getSite = getSite;
exports.getSiteConfig = getSiteConfig;
exports.getShopUrl = getShopUrl;
exports.prepareInput = prepareInput;

function getRepoConnection(id, branch) {
  let conn = null;
  if (!branch) {
    var branch = "master";
  }
  contextLib.runAsAdmin(function () {
    if (!repoLib.get(id)) {
      createRepo(id);
    }
  });
  return nodeLib.connect({
    repoId: id,
    branch: branch
  });
}

function createRepo(id) {
  let repo = repoLib.create({
    id: id
  });
  return repo;
}

function getShopUrl(params) {
  if (!params) {
    var params = {};
  }
  var site = portal.getSiteConfig();
  return portal.pageUrl({
    id: site.shopLocation,
    params: params
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

function prepareInput(input) {
  delete input.occurrences;
  delete input.maximize;
  delete input.config;
  return input;
}
