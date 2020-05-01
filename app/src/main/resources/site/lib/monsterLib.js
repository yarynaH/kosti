var contentLib = require("/lib/xp/content");
var portal = require("/lib/xp/portal");
var thymeleaf = require("/lib/thymeleaf");
var common = require("/lib/xp/common");

var norseUtils = require("norseUtils");
var userLib = require("userLib");
var contextLib = require("contextLib");
var hashLib = require("hashLib");
var sharedLib = require("sharedLib");
var blogLib = require("blogLib");
var helpers = require("helpers");

exports.getInputs = getInputs;

function getInputs(params) {
  if (!params) {
    params = {};
  }
  if (!params.action) {
    params.action = "create";
  }
  var contentType = contentLib.getType(app.name + ":monster");
  var inputs = {
    alignment: null,
    sizes: null,
    typeOptions: null,
    stats: [],
    savethrow: [],
    misc: [],
    type: [],
    hp: [],
    damageImmune: [],
    skills: [],
    speed: [],
    actions: [],
    specialAbilities: [],
    reactions: [],
    legendaryActions: []
  };
  for (var i = 0; i < contentType.form.length; i++) {
    var item = contentType.form[i];
    var itemDisplay =
      item && item.config && item.config.display && item.config.display[0]
        ? item.config && item.config.display && item.config.display[0]
        : null;
    if (item.name === "alignment") {
      inputs.alignmentSelect = helpers.getSelectComponent({
        name: "alignment",
        id: "alignment-select",
        defaultText: "Select alignment",
        selected: params.content ? params.content.data.alignment : null,
        options: item.config.option
      });
    } else if (item.name === "type") {
      inputs.typeSelect = helpers.getSelectComponent({
        name: "type",
        id: "type-select",
        selected: params.content ? params.content.data.type : null,
        defaultText: "Select type",
        options: item.config.option
      });
    } else if (item.name === "size") {
      inputs.sizeSelect = helpers.getSelectComponent({
        name: "size",
        id: "size-select",
        selected: params.content ? params.content.data.size : null,
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
        inputs[item.name].push(sharedLib.prepareInput(tempItem));
      }
    } else if (
      ["actions", "legendaryActions", "reactions", "specialAbilities"].indexOf(
        item.name
      ) !== -1
    ) {
      inputs[item.name] = params.content
        ? prepareActions(params.content.data[item.name])
        : null;
    } else if (itemDisplay && itemDisplay["@group"]) {
      if (itemDisplay["@" + params.action] == "true") {
        inputs[itemDisplay["@group"]].push(sharedLib.prepareInput(item));
      }
    }
  }
  return inputs;
}

function prepareActions(actions) {
  if (!actions) {
    return "";
  }
  var result = [];
  var view = resolve("../pages/components/form/action.html");
  actions = norseUtils.forceArray(actions);
  for (var i = 0; i < actions.length; i++) {
    result.push(
      thymeleaf.render(view, {
        name: actions[i].name,
        description: actions[i].desc
      })
    );
  }
  return result;
}
