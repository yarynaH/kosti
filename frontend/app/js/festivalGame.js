function initKosticonnetcScripts() {
  $(".js_sign-up-for-game").on("click", function (e) {
    e.preventDefault();
    var data = { gameId: $(".js_game-id").data().id };
    $("input").each(function () {
      data[$(this).attr("name")] = $(this).val();
    });
    $.ajax({
      url: "/api/festival/game",
      data: data,
      type: "POST",
      success: function (data) {}
    });
  });

  $(".js_sign-up-for-game").click(function(){
    $(".js_sign-up-step-1").toggle("slow");
});
}

$(document).ready(function () {
  initKosticonnetcScripts();
});
