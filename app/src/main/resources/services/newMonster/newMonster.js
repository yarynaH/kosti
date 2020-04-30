var thymeleaf = require("/lib/thymeleaf");
var portal = require("/lib/xp/portal");
var contentLib = require("/lib/xp/content");
var i18nLib = require("/lib/xp/i18n");

var libLocation = "../../site/lib/";
var norseUtils = require(libLocation + "norseUtils");
var helpers = require(libLocation + "helpers");
var userLib = require(libLocation + "userLib");
var kostiUtils = require(libLocation + "kostiUtils");
var articlesLib = require(libLocation + "articlesLib");
var hashtagLib = require(libLocation + "hashtagLib");
var blogLib = require(libLocation + "blogLib");

exports.get = handleGet;

function handleGet(req) {
  var view = resolve("../../site/pages/monster/monster.html");
  var contentType = contentLib.getType(app.name + ":monster");
  var inputs = {
    alignmentSelect: null,
    sizeSelect: null,
    typeSelect: null,
    stats: [],
    savethrow: [],
    misc: [],
    type: [],
    hp: [],
    damageImmune: [],
    skills: [],
    speed: []
  };
  for (var i = 0; i < contentType.form.length; i++) {
    var item = contentType.form[i];
    var itemDisplay =
      item && item.config && item.config.display && item.config.display[0]
        ? item.config && item.config.display && item.config.display[0]
        : null;
    if (item.name === "alignment") {
      inputs.alignmentSelect = getSelectComponent({
        name: "alignment",
        id: "alignment-select",
        defaultText: "Select alignment",
        options: item.config.option
      });
    } else if (item.name === "type") {
      inputs.typeSelect = getSelectComponent({
        name: "type",
        id: "type-select",
        defaultText: "Select type",
        options: item.config.option
      });
    } else if (item.name === "size") {
      inputs.sizeSelect = getSelectComponent({
        name: "size",
        id: "size-select",
        defaultText: "Select size",
        options: item.config.option
      });
    } else if (item.name === "skills" || item.name === "speed") {
      for (var j = 0; j < item.items.length; j++) {
        var tempItem = item.items[j];
        tempItem.display =
          tempItem &&
          tempItem.config &&
          tempItem.config.display &&
          tempItem.config.display[0]
            ? tempItem.config &&
              tempItem.config.display &&
              tempItem.config.display[0]
            : null;
        inputs[item.name].push(prepareInput(tempItem));
      }
    } else if (itemDisplay && itemDisplay["@group"]) {
      item.display = itemDisplay;
      inputs[itemDisplay["@group"]].push(prepareInput(item));
    } else if (itemDisplay && itemDisplay["@group"]) {
      item.display = itemDisplay;
      inputs[itemDisplay["@group"]].push(prepareInput(item));
    }
  }
  //TODO upgrade controller to new template
  var body = thymeleaf.render(view, {
    pageComponents: helpers.getPageComponents(req, null, null, "Новая статья"),
    inputs: inputs
  });
  return {
    body: body,
    contentType: "text/html"
  };

  function prepareInput(input) {
    delete input.occurrences;
    delete item.maximize;
    delete item.config;
    return input;
  }

  function getSelectComponent(params) {
    var view = resolve("../../site/pages/components/form/select.html");
    return thymeleaf.render(view, params);
  }
}
