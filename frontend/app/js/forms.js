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
      $(js_wrap).html(data.html);
      hideLoader();
      $(js_wrap).slideDown("slow");
    }
  });
}

function addNewGame(dataJson) {
  showLoader();
  var data = {
    action: "addGame",
    data: dataJson
  };
  $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/formGM",
    data: data,
    type: "POST",
    success: function(data) {
      console.log(data);
      hideLoader();
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

$(".js-my_games").on("change", ".js-my_games-system", function(e) {
  var target = $(".js-my_games-system option:selected").val();

  if (target == "other") {
    $(".js-my_games-system-input").show();
  } else {
    $(".js-my_games-system-input").hide();
  }
});

$(".js-my_games").on("click", ".js-my_games-step3-save", function(e) {
  e.preventDefault();
  var addNewGameData = {};
  $(".js-my_games-form input").each(function() {
    if ($(this).attr("name") == "systemInput") {
      return;
    }
    if ($(this).is(":checkbox")) {
      if ($(this).is(":checked")) {
        addNewGameData[$(this).attr("name")] = true;
      } else {
        addNewGameData[$(this).attr("name")] = false;
      }
      return;
    }
    addNewGameData[$(this).attr("name")] = $(this).val();
  });

  var gameSystem = {};
  if ($(".js-my_games-system").val() == "other") {
    gameSystem["select"] = $(".js-my_games-system").val();
    gameSystem["text"] = $(".js-my_games-system-input").val();
    gameSystem["_selected"] = "input";
  } else {
    gameSystem["select"] = $(".js-my_games-system").val();
    gameSystem["text"] = "";
    gameSystem["_selected"] = "select";
  }
  addNewGameData["gameSystem"] = gameSystem;

  addNewGameData[$(".js-my_games-form textarea").attr("name")] = $(
    ".js-my_games-form textarea"
  ).val();

  console.log(addNewGameData);

  addNewGame(JSON.stringify(addNewGameData));
});
