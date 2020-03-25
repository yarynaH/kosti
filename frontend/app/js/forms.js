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

$(".js-my_games-step1").on("click", function(e) {
  appendStep("locationComp", ".js-my_games-location-wrapper");
});

$(".js-my_games-step1").on("click", function(e) {
  appendStep("gameBlocksComp", ".js-my_games-game_block-wrapper");
  $(this).toggleClass("active");
});
