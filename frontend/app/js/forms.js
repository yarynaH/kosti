function appendStep(viewType, js_wrap) {
  showLoader();
  var data = {
    action: "getView",
    viewType: viewType
  };
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
  } else {
    $(".js-my_games-step1").removeClass("active");
    $(".js-my_games-game_block-wrapper").html("");
  }

  $(this).addClass("active");
  appendStep("locationComp", $(this).find(".js-my_games-location-wrapper"));
  appendStep("gameBlocksComp", $(this).find(".js-my_games-game_block-wrapper"));
});
