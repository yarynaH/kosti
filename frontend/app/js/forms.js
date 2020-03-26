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
      $(js_wrap).slideDown("slow");
    }
  });
}

$(".js-my_games").on("click", ".js-my_games-step1", function(e) {
  var parent = $(this).parent();
  if (parent.hasClass("active")) {
    parent.find(".js-my_games-step2-data").slideUp("slow", function() {
      parent.find(".js-my_games-step2-data").html("");
      parent.removeClass("active");
    });
    return;
  } else {
    $(".js-my_games-step2-data").slideUp("slow", function() {
      $(".js-my_games-step2-data").html("");
      $(".js-my_games-step1-parent").removeClass("active");
    });
  }

  parent.addClass("active");
  appendStep(
    "locationAndGameBlockComp",
    parent.find(".js-my_games-step2-data"),
    parent.data().id
  );
});

$(".js-my_games").on("click", ".js-my_games-location-item", function(e) {
  if ($(this).hasClass("active")) {
    return;
  } else {
    $(".js-my_games-location-item").removeClass("active");
  }

  $(this).addClass("active");
  appendStep(
    "gameBlocksComp",
    $(".js-my_games-game_block-wrapper"),
    $(this).data().id
  );
});

$(".js-my_games").on("click", ".js-my_games-step1-discard", function(e) {
  $(".js-my_games-step1-parent").removeClass("active");
  $(".js-my_games-step2-data").html("");
});

$(".js-my_games").on("click", ".js-my_games-step1-select", function(e) {
  appendStep(
    "addGameForm",
    $(".js-my_games-wrapper"),
    $("input[name='game_block']:checked").data().id
  );
});

$(".js-my_games").on("click", ".js-my_games-step3-discard", function(e) {
  appendStep("scheduleComp", $(".js-my_games-wrapper"));
});
