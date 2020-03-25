function appendStep(viewType, js_wrap) {
  showLoader();
  var form_data = new FormData();
  form_data.append("action", "getView");
  form_data.append("viewType", viewType);
  $.ajax({
    url: "http://localhost:8080/_/service/com.myurchenko.kostirpg/formGM",
    data: form_data,
    processData: false,
    contentType: false,
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
