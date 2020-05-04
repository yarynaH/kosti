function getActionComponent(id) {
  showLoader();
  $.ajax({
    url: "/api/monster/create",
    data: { id: id },
    type: "GET",
    success: function (data) {
      $(".js_monster-actions").append(data.html);
      hideLoader();
    }
  });
}

$(".js_add-action-button-general ").on("click", function (e) {
  e.preventDefault();
  var id = getId($(this).parent());
  getActionComponent(id);
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
