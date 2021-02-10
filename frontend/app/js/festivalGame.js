var updateUserDataUrl = "/api/festival/userdata";
var gameSignUpUrl = "/api/festival/gamesignup";

function initKosticonnetcScripts() {
  $(".js_sign-up-for-game").on("click", function (e) {
    e.preventDefault();

    if ($(".js_game-sign-up-step-1").length > 0) {
      $(".js_game-sign-up-step-1").show("slow");
    } else if ($(".js_game-sign-up-step-2").length > 0) {
      $(".js_game-sign-up-step-2").show("slow");
    } else {
      signupForGame();
    }
  });
}

$(".js_game-sign-up-step-1").on("submit", function (e) {
  e.preventDefault();
  updateUserData();
});

function updateUserData() {
  var data = { gameId: $(".js_game-id").data().id };
  $(".js_get-user-data").each(function () {
    data[$(this).attr("name")] = $(this).val();
  });
  $.ajax({
    url: updateUserDataUrl,
    data: data,
    type: "POST",
    success: function (data) {
      if (!data.error) {
        if ($(".js_game-sign-up-step-2").length > 0) {
          $(".js_game-sign-up-step-1").hide("slow");
          $(".js_game-sign-up-step-2").show("slow");
        }
      }
    }
  });

  $(".js_sign-up-for-game").click(function () {
    $(".js_sign-up-step-1").toggle("slow");
  });
}

function signupForGame() {
  var data = { gameId: $(".js_game-id").data().id };
  $.ajax({
    url: gameSignUpUrl,
    data: data,
    type: "POST",
    success: function (data) {
      showSnackBar("Вы зарегистрированы.", "success");
    },
    error: function (data) {
      showSnackBar("Произошла ошибка.", "error");
    }
  });
}

function updateUserDiscord() {
  //show discord button
}

$(document).ready(function () {
  initKosticonnetcScripts();
});
