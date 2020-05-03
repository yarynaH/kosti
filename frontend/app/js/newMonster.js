function getActionComponent(id) {
  showLoader();
  $.ajax({
    url: "/api/monster/create",
    data: { id: id },
    type: "GET",
    success: function (data) {
      hideLoader();
    }
  });
}

$(".js_add-action-button-general ").on("click", function (e) {
  e.preventDefault();
  getActionComponent("1");
});
