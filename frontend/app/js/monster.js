function initMonster() {
  $(".js_monster-form").on("submit", function(e) {
    e.preventDefault();
    var data = getFormData(this);
    data = prepareActions(data);
    var call = $.ajax({
      url: monsterServiceUrl,
      type: "POST",
      data: {
        data: JSON.stringify(data)
      },
      success: function() {
        showSnackBar("Успех", "success");
      },
      error: function() {
        showSnackBar("Произошла ошибка", "error");
      }
    });
  });

  function prepareActions(data) {
    data.legendaryActions = [];
    data.actions = [];
    data.reactions = [];
    data.specialAbilities = [];
    if (data.actionsNameLeg) {
      for (var i = 0; i < data.actionsNameLeg.length; i++) {
        data.legendaryActions.push({
          name: data.actionsNameLeg[i],
          desc: data.actionsDescLeg[i]
        });
      }
    }
    if (data.actionsName) {
      for (var i = 0; i < data.actionsName.length; i++) {
        data.actions.push({
          name: data.actionsName[i],
          desc: data.actionsDesc[i]
        });
      }
    }
    if (data.specialAbilityName) {
      for (var i = 0; i < data.specialAbilityName.length; i++) {
        data.specialAbilities.push({
          name: data.specialAbilityName[i],
          desc: data.specialAbilityDesc[i]
        });
      }
    }
    if (data.reactionName) {
      for (var i = 0; i < data.reactionName.length; i++) {
        data.specialAbilities.push({
          name: data.reactionName[i],
          desc: data.reactionDesc[i]
        });
      }
    }

    delete data.actionsName;
    delete data.actionsDesc;
    delete data.specialAbilityName;
    delete data.specialAbilityDesc;
    delete data.actionsNameLeg;
    delete data.actionsDescLeg;
    return data;
  }
}

$(document).ready(function() {
  initMonster();
});
