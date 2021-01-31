var updateUserDataUrl = "/api/festival/userdata";

function initKosticonnetcScripts() {
  $(".js_sign-up-for-game").on("click", function (e) {
    e.preventDefault();

    if ($(".js_get-user-data").length > 0) {
      updateUserData();
    } else if ($(".js_connect-discord").length > 0) {
      updateUserDiscord();
    } else {
      signupForGame();
    }
  });
}

function updateUserData() {
  var data = { gameId: $(".js_game-id").data().id };
  $(".js_get-user-data").each(function () {
    data[$(this).attr("name")] = $(this).val();
  });
  $.ajax({
    url: updateUserDataUrl,
    data: data,
    type: "POST",
    success: function (data) {}
  });

  $(".js_sign-up-for-game").click(function(){
    $(".js_sign-up-step-1").toggle("slow");
});
}

function updateUserDiscord() {
  //show discord button
}

$(document).ready(function () {
  initKosticonnetcScripts();
});
