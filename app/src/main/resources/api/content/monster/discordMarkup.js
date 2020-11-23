const i18nLib = require("/lib/xp/i18n");

const libLocation = "/site/lib/";
const norseUtils = require(libLocation + "norseUtils");

exports.createMarkup = createMarkup;

function createMarkup(monster) {
  if (!monster) return [];
  var reply = [];
  var res = "\n";
  res += "**" + monster.displayName + "**\n";
  res +=
    "*" +
    i18nLib.localize({
      key: "monster.size." + monster.data.size,
      locale: "ru"
    }) +
    " " +
    i18nLib.localize({
      key: "monster.type." + monster.data.type,
      locale: "ru"
    }) +
    ", " +
    i18nLib.localize({
      key: "monster.alignment." + monster.data.alignment,
      locale: "ru"
    }) +
    "*\n\n";
  res += "Коэфициент брони: " + monster.data.armorClass;
  res += monster.data.armorDesc ? "(" + monster.data.armorDesc + ")" : "";
  res += "\n";
  res +=
    "Здоровье: " + monster.data.hitPoints + "(" + monster.data.hitDice + ")\n";
  res += "Скорость: " + monster.data.speed.walk + " фт.\n\n";
  res +=
    "   **СИЛ**   |   **ЛОВ**   |   **ВЫН**   |   **ИНТ**   |   **МДР**   |   **ХАР**   \n";
  res += getStats() + "\n\n";
  res += "Сложность: " + monster.data.challengeRating + "\n";
  res += monster.data.senses ? "Чувства: " + monster.data.senses + "\n" : "";
  res += monster.data.languages
    ? "Языки: " + monster.data.languages + "\n"
    : "";
  res += getSavingThrows();
  res += getSkills();
  var actions = [];
  actions.push("\n**Действия**\n" + getActions("actions"));

  if (monster.data.legendaryActions) {
    actions.push(
      "\n**Легендарные действия**\n" + getActions("legendaryActions")
    );
  }
  if (monster.data.specialAbilities) {
    actions.push("\n**Особые умения**\n" + getActions("specialAbilities"));
  }
  var actionsLength = 0;
  var actionsString = "";
  actions.forEach((action) => {
    actionsLength += action.length;
    actionsString += action;
  });
  if (actionsLength + res.length < 1900) {
    res += actionsString;
    reply.push(res);
  } else if (actionsLength < 1900) {
    reply.push(res);
    reply.push(actionsString);
  } else {
    reply.push(res);
    Array.prototype.push.apply(reply, actions);
  }
  return reply;

  function getActions(type) {
    var actions = "";
    var monsterActions = norseUtils.forceArray(monster.data[type]);
    monsterActions.forEach((a) => {
      actions += a.name + ". " + a.desc + "\n\n";
    });
    return actions;
  }

  function getSkills() {
    var res = "";
    for (var prop in monster.data.skills) {
      if (res !== "") {
        res += ", ";
      }
      res +=
        i18nLib.localize({
          key: "monster.skills." + prop,
          locale: "ru"
        }) +
        " " +
        (parseInt(monster.data.skills[prop]) > 0
          ? "+" + monster.data.skills[prop]
          : monster.data.skills[prop]);
    }
    if (res !== "") {
      res = "Навыки: " + res + "\n\n";
    }
    return res;
  }

  function getStats() {
    var res = "";
    var stats = [
      monster.data.strength,
      monster.data.dexterity,
      monster.data.constitution,
      monster.data.intelligence,
      monster.data.wisdom,
      monster.data.charisma
    ];
    stats.forEach((s) => {
      var modifier = getModifier(s);
      s = s.toString();
      if ((s + modifier).length === 3) {
        res += "  " + s + " (" + modifier + ")  |";
      } else if ((s + modifier).length === 5) {
        res += "" + s + " (" + modifier + ") |";
      } else {
        res += " " + s + " (" + modifier + ") |";
      }
    });
    return res;
  }

  function getSavingThrows() {
    var res = "";
    res += monster.data.strengthSave
      ? " СИЛ +" + monster.data.strengthSave
      : "";
    res += monster.data.dexteritySave
      ? " ЛОВ +" + monster.data.dexteritySave
      : "";
    res += monster.data.constitutionSave
      ? " ВЫН +" + monster.data.constitutionSave
      : "";
    res += monster.data.intelligenceSave
      ? " ИНТ +" + monster.data.intelligenceSave
      : "";
    res += monster.data.wisdomSave ? " МДР +" + monster.data.wisdomSave : "";
    res += monster.data.charismaSave
      ? " ХАР +" + monster.data.charismaSave
      : "";
    if (res != "") {
      res = "Спасброски:" + res + "\n";
    }
    return res;
  }

  function getModifier(value) {
    var value = Math.floor((parseInt(value) - 10) / 2).toFixed();
    if (value > 0) {
      return "+" + value;
    }
    return value;
  }
}
