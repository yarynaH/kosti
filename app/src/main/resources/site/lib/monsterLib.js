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
exports.getActionComponent = getActionComponent;
exports.createMonster = createMonster;
exports.updateMonster = updateMonster;

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
        defaultText: "Выберите мировозрение",
        selected: params.content ? params.content.data.alignment : null,
        options: item.config.option
      });
    } else if (item.name === "type") {
      inputs.typeSelect = helpers.getSelectComponent({
        name: "type",
        id: "type-select",
        selected: params.content ? params.content.data.type : null,
        defaultText: "Выберите тип",
        options: item.config.option
      });
    } else if (item.name === "size") {
      inputs.sizeSelect = helpers.getSelectComponent({
        name: "size",
        id: "size-select",
        selected: params.content ? params.content.data.size : null,
        defaultText: "Выберите размер",
        options: item.config.option
      });
    } else if (
      (item.name === "skills" || item.name === "speed") &&
      params.action !== "translate"
    ) {
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

function createMonster(data) {
  var displayName = data.name;
  delete data.name;
  data.translated = true;
  var site = portal.getSiteConfig();
  var blog = contentLib.get({ key: site.monstersLocation });
  var result = contentLib.create({
    name: common.sanitize(displayName),
    parentPath: blog._path,
    displayName: displayName,
    contentType: app.name + ":monster",
    data: data
  });
  var publishResult = contentLib.publish({
    keys: [result._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  return result;
}

function deleteMonster(data) {
  return {};
}

function updateMonster(data) {
  var displayName = data.name;
  var id = data.id;
  delete data.name;
  delete data.id;
  var result = contentLib.modify({
    key: id,
    editor: function (c) {
      c.displayName = displayName;
      c.data = data;
      return c;
    }
  });
  var publishResult = contentLib.publish({
    keys: [result._id],
    sourceBranch: "master",
    targetBranch: "draft"
  });
  return result;
}

function getActionComponent(params) {
  if (!params) {
    params = {};
  }
  return thymeleaf.render(resolve("../pages/components/form/action.html"), {
    id: params.id,
    type: params.type
  });
}
