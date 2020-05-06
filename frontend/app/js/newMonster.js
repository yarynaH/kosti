function getActionComponent(params) {
  showLoader();
  if (typeof params.parentSelector === "string") {
    params.parentSelector = $(params.parentSelector);
  }
  $.ajax({
    url: "/api/monster/create",
    data: { id: params.id, type: params.type },
    type: "GET",
    success: function (data) {
      params.parentSelector.append(data.html);
      hideLoader();
    }
  });
}

$(".js_add-action-button-general ").on("click", function (e) {
  e.preventDefault();
  var parent = $(this).parent();
  var id = getId(parent);
  getActionComponent({
    id: id,
    parentSelector: parent,
    type: $(this).data().type
  });
});

function getId(el) {
  var actions = el.find(".js_action-block");
  var id = 0;
  if (actions.length === 0) {
    return 0;
  }
  actions.each(function () {
    id = Math.max(parseInt($(this).data().id), id);
  });
  return id + 1;
}

$(".js_save-button").on("click", function (e) {
  e.preventDefault();
  showLoader();
  var data = getMonsterData();
  $.ajax({
    url: "/api/monster/create",
    data: data,
    type: $(".js_monster-id").length > 0 ? "POST" : "PUT",
    success: function (data) {
      hideLoader();
    }
  });
});

function getMonsterData() {
  var data = { actions: [] };
  $(".js_monster-form input:not(.js_monster-action)").each(function () {
    var group = $(this).data().group;
    if (group) {
      if (!data[group]) {
        data[group] = {};
      }
      data[group][$(this).attr("name")] = $(this).val()
        ? $(this).val()
        : undefined;
    } else {
      data[$(this).attr("name")] = $(this).val() ? $(this).val() : undefined;
    }
  });
  $(".js_action-block").each(function () {
    var group = $(this).data().group;
    if (!data[group]) {
      data[group] = [];
    }
    data[group].push({
      name: $(this).find("input").val(),
      desc: $(this).find("textarea").val()
    });
  });
  return data;
}
