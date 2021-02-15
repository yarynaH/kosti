var updateUserDataUrl = "/api/festival/userdata";
var gameSignUpUrl = "/api/festival/gamesignup";
var gameSignOutUrl = "/api/festival/gamesignout";

function initKosticonnetcScripts() {
  $(".js_game-sign-up-step-1").validate({
    ignore: [],
    highlight: function (element, errorClass, validClass) {},
    unhighlight: function (element, errorClass, validClass) {}
  });
  $(".js_festival-agreement").validate({
    ignore: [],
    highlight: function (element, errorClass, validClass) {},
    unhighlight: function (element, errorClass, validClass) {}
  });

  $(".js_sign-out-of-game").on("click", function (e) {
    e.preventDefault();
    signOutOfGame();
  });

  $(".js_sign-up-for-game").on("click", function (e) {
    showLoader();
    e.preventDefault();

    if (
      $(".js_game-sign-up-step-1").length > 0 &&
      $(this).data().step === "init"
    ) {
      $(".js_game-sign-up-step-1").show("slow");
      $(this).data().step = "discord";
      hideLoader();
    } else if (
      $(".js_game-sign-up-step-2").length > 0 &&
      $(this).data().step === "discord"
    ) {
      updateUserData();
    } else if (
      $(".js_game-sign-up-step-2").length === 0 &&
      $(this).data().step === "discord"
    ) {
      updateUserData();
    } else {
      signupForGame();
    }
  });
}

$(".js_game-sign-up-step-1").on("submit", function (e) {
  e.preventDefault();
  updateUserData();
});

function signOutOfGame() {
  var data = { gameId: $(".js_game-id").data().id };
  $.ajax({
    url: gameSignOutUrl,
    data: data,
    type: "POST",
    success: function (data) {
      hideLoader();
      showSnackBar("Вы отписались.", "success");
    },
    error: function (data) {
      hideLoader();
      showSnackBar("Произошла ошибка.", "error");
    }
  });
}

function updateUserData() {
  if (!$(".js_game-sign-up-step-1").valid()) {
    hideLoader();
    return false;
  }
  var data = { gameId: $(".js_game-id").data().id };
  $(".js_get-user-data").each(function () {
    data[$(this).attr("name")] = $(this).val();
  });
  $.ajax({
    url: updateUserDataUrl,
    data: data,
    type: "POST",
    success: function (data) {
      hideLoader();
      if (!data.error) {
        if ($(".js_game-sign-up-step-2").length > 0) {
          $(".js_game-sign-up-step-1").hide("slow");
          $(".js_game-sign-up-step-2").show("slow");
          $(".js_sign-up-for-game").hide();
        }
        if (data.message) {
          showSnackBar(data.message, "success");
        }
      } else {
        showSnackBar(data.message, "error");
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
      hideLoader();
      if (data.error) {
        showSnackBar(data.message, "error");
      } else {
        if (data.message) showSnackBar(data.message, "success");
        else showSnackBar("Вы зарегистрированы.", "success");
      }
    },
    error: function (data) {
      hideLoader();
    }
  });
}

$(document).ready(function () {
  initKosticonnetcScripts();
});
