function appendStep(viewType, js_wrap, id) {
  showLoader();
  var data = {
    action: "getView",
    viewType: viewType
  };
  if (id) {
    data.id = id;
  }
  return $.ajax({
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
// $(".js-my_games-step1").on("click", function(e) {
//   appendStep("locationComp", $(this).find(".js-my_games-location-wrapper"));
// });

$(".js-my_games-step1").on("click", function(e) {
  if ($(this).hasClass("active")) {
    $(this).removeClass("active");
    $(this)
      .find(".js-my_games-location-wrapper")
      .html("");
    $(this)
      .find(".js-my_games-game_block-wrapper")
      .html("");
    return;
  } else {
    $(".js-my_games-step1.active").removeClass("active");
    $(".js-my_games-game_block-wrapper").html("");
    $(".js-my_games-location-wrapper").html("");
  }

  $(this).addClass("active");
  var call = appendStep(
    "locationComp",
    $(this).find(".js-my_games-location-wrapper"),
    $(this).data().id
  );
  var _this = $(this);
  call.done(function() {
    if (!$(".js-my_games-location-item.active").length) {
      $(".js-my_games-location-item")
        .first()
        .addClass("active");
      appendStep(
        "gameBlocksComp",
        _this.find(".js-my_games-game_block-wrapper"),
        $(".js-my_games-location-item").data().id
      );
    }
  });
});
