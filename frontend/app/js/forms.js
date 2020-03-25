function appendStep(viewType, js_wrap, id) {
  showLoader();
  var data = {
    action: "getView",
    viewType: viewType
  };
  if (id) {
    data.id = id;
  }
  $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/formGM",
    data: data,
    type: "GET",
    success: function(data) {
      // AddAction();
      $(js_wrap).html(data.html);
      hideLoader();
    }
  });
}

$(".js-my_games-step1").on("click", function(e) {
  var parent = $(this).parent();
  if (parent.hasClass("active")) {
    parent.removeClass("active");
    parent.find(".js-my_games-step2-data").html("");
    return;
  } else {
    $(".js-my_games-step1-parent").removeClass("active");
    $(".js-my_games-step2-data").html("");
  }

  parent.addClass("active");
  appendStep(
    "locationAndGameBlockComp",
    parent.find(".js-my_games-step2-data"),
    parent.data().id
  );
});
