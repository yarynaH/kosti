var portal = require("/lib/xp/portal");
var contextLib = require("/lib/contextLib");
var contentLib = require("/lib/xp/content");
var thymeleaf = require("/lib/thymeleaf");

var libLocation = "../../site/lib/";
var helpers = require(libLocation + "helpers");
var norseUtils = require(libLocation + "norseUtils");
var formLib = require(libLocation + "formLib");

exports.get = function(req) {
  var params = req.params;
  switch (params.action) {
    case "games":
      var view = resolve("kosticon2019.html");
      var model = {
        pageComponents: helpers.getPageComponents(req),
        legendary: params.type == "legendary" ? true : false
      };
      break;
    case "result":
      var view = resolve("formResults.html");
      var model = {
        results: orderResults(formLib.getForms("kosticon2019")),
        pageComponents: helpers.getPageComponents(req)
      };
      break;
    default:
      var view = resolve("kosticon2019.html");
      var model = {
        pageComponents: helpers.getPageComponents(req),
        legendary: params.type == "legendary" ? true : false
      };
      break;
  }
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };
};

exports.post = function(req) {
  var params = req.params;
  switch (params.action) {
    case "submitForm":
      delete params.action;
      delete params.submit;
      formLib.submitForm(params);
      var view = resolve("successSubmit.html");
      var model = {
        pageComponents: helpers.getPageComponents(req)
      };
      break;
    case "checkspace":
      return {
        body: { space: formLib.checkSpace(params) },
        contentType: "application/json"
      };
      break;
    default:
      var view = resolve("successSubmit.html");
      var model = {
        pageComponents: helpers.getPageComponents(req)
      };
      break;
  }
  return {
    body: thymeleaf.render(view, model),
    contentType: "text/html"
  };
};

function orderResults(data) {
  var result = {};
  var keys = ["game1", "game2", "game3", "game4", "game5"];
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < keys.length; j++) {
      if (data[i][keys[j]]) {
        if (!result[keys[j]]) {
          result[keys[j]] = {};
        }
        if (!result[keys[j]][data[i][keys[j]]]) {
          result[keys[j]][data[i][keys[j]]] = [];
        }
        result[keys[j]][data[i][keys[j]]].push({
          name: data[i].name,
          id: data[i].id
        });
      }
    }
  }
  return result;
}
