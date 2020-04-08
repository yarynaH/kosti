function appendStep(viewType, js_wrap, id) {
  showLoader();
  var data = {
    action: "getView",
    viewType: viewType,
  };
  if (id) {
    data.id = id;
  }
  return $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/formGM",
    data: data,
    type: "GET",
    success: function (data) {
      $(js_wrap).html(data.html);
      hideLoader();
      $(js_wrap).slideDown("slow");
    },
  });
}

function addNewGame(dataJson) {
  showLoader();
  var data = {
    data: dataJson,
  };
  $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/formGM",
    data: data,
    type: "POST",
    success: function (data) {
      if (data.error == true) {
        showSnackBar(data.message, "error");
      } else {
        showSnackBar(data.message, "success");
        $(".js-my_games-wrapper").html(data.html);
      }
      hideLoader();
    },
    error: function (data) {
      showSnackBar(data.message, "error");
    },
  });
}

function removeGame(id) {
  showLoader();
  var data = {
    data: JSON.stringify({
      action: "deleteGame",
      id: id,
    }),
  };
  $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/formGM",
    data: data,
    type: "POST",
    success: function () {
      showSnackBar("Game is deleted", "success");
    },
    error: function () {
      showSnackBar("Some errror!", "error");
    },
  });
}
function appendBlock(parent) {
  var call = appendStep(
    "locationAndGameBlockComp",
    parent.find(".js-my_games-step2-data"),
    parent.data().id
  );

  call.done(function () {
    parent.addClass("active");
    parent.find(".js-my_games-available-wrapper").slideDown("slow");
    parent.find(".js-my_games-table_slot").slideUp();
  });
}

function removeBlock(append, parent) {
  var clearData;
  $(".js-my_games-step2-data").slideUp("slow", function () {
    clearData = $(".js-my_games").find(".js-my_games-step2-data");
    $(".js-my_games-step1-parent").removeClass("active");
    if (append == true) {
      appendBlock(parent);
    }
  });
  $(".js-my_games-available-wrapper").slideUp("slow");
  $(".js-my_games-add_game_btn-wrap").slideUp("slow");
  $(".js-my_games-table_slot").slideDown();
  $(".js-my_games-day_slot-title").slideUp("slow");
  $(".js-my_games-available-item").removeClass("expanded");
  $(".js-my_games-available-long_info").slideUp("slow");
  clearData.html("");
}

function activateValidation(element) {
  $(element).validate({
    ignore: [],
    highlight: function (element, errorClass, validClass) {},
    unhighlight: function (element, errorClass, validClass) {},
  });
}

$(".js-my_games").on("click", ".js-my_games-step1", function (e) {
  var parent = $(this).parent();
  if (parent.hasClass("active")) {
    removeBlock();
  } else {
    if (parent.find(".js-my_games-available-list").length > 0) {
      removeBlock();
      parent.addClass("active");
      parent.find(".js-my_games-available-wrapper").slideDown("slow");
      parent.find(".js-my_games-add_game_btn-wrap").slideDown("slow");
      parent.find(".js-my_games-table_slot").slideUp();
    } else {
      removeBlock(true, parent);
    }
  }
});

$(".js-my_games").on("click", ".js-my_games-add_game_btn", function (e) {
  var parent = $(this).closest(".js-my_games-step1-parent");
  appendBlock(parent);
  $(".js-my_games-add_game_btn-wrap").slideUp("slow");
  parent.find(".js-my_games-day_slot-title").slideDown("slow");
});

$(".js-my_games").on("click", ".js-my_games-location-item", function (e) {
  if ($(this).hasClass("active")) {
    return;
  } else {
    $(".js-my_games-location-item").removeClass("active");
  }

  $(this).addClass("active");
  $(".js-my_games-step1-select").prop("disabled", true);
  appendStep(
    "gameBlocksComp",
    $(".js-my_games-game_block-wrapper"),
    $(this).data().id
  );
});

$(".js-my_games").on("click", ".js-my_games-game_block-item", function (e) {
  if ($(".js-my_games-step1-select:disabled")) {
    $(".js-my_games-step1-select").prop("disabled", false);
  }
});

$(".js-my_games").on("click", ".js-my_games-step1-select", function (e) {
  var call = appendStep(
    "addGameForm",
    $(".js-my_games-wrapper"),
    $("input[name='game_block']:checked").data().id
  );
  call.done(function () {
    activateValidation(".js-my_games-form");
    scrollToItem($(".js-my_games"));
  });
});

$(".js-my_games").on("click", ".js-my_games-step1-discard", function (e) {
  removeBlock();
});

$(".js-my_games").on("click", ".js-my_games-step3-discard", function (e) {
  e.preventDefault();
  appendStep("scheduleComp", $(".js-my_games-wrapper"));
});

$(".js-my_games").on("change", ".js-my_games-system", function (e) {
  var target = $(".js-my_games-system option:selected").val();

  if (target == "other") {
    $(".js-my_games-system-input").show();
  } else {
    $(".js-my_games-system-input").hide();
  }
});

$(".js-my_games").on("click", ".js-my_games-step3-save", function (e) {
  e.preventDefault();
  var addNewGameData = {};

  if (!$(".js-my_games-form").valid()) {
    return false;
  }

  $(".js-my_games-form input").each(function () {
    if ($(this).attr("name") == "systemInput") {
      return;
    }

    if ($(this).is(":radio")) {
      if ($(this).is(":checked")) {
        addNewGameData[$(this).attr("name")] = $(this).val();
      }
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
    gameSystem["select"] = { system: $(".js-my_games-system").val() };
    gameSystem["text"] = { system: $(".js-my_games-system-input").val() };
    gameSystem["_selected"] = "text";
  } else {
    gameSystem["select"] = { system: $(".js-my_games-system").val() };
    gameSystem["text"] = { system: "" };
    gameSystem["_selected"] = "select";
  }
  addNewGameData["gameSystem"] = gameSystem;

  addNewGameData[$(".js-my_games-form textarea").attr("name")] = $(
    ".js-my_games-form textarea"
  ).val();

  addNewGame(JSON.stringify(addNewGameData));
});

$(".js-my_games").on("click", ".js-my_games-available-short_info", function (
  e
) {
  var parent = $(this).parent();
  if (parent.hasClass("expanded")) {
    parent.removeClass("expanded");
    parent.find(".js-my_games-available-long_info").slideUp("slow");
    return;
  } else {
    $(".js-my_games-available-item").removeClass("expanded");
    $(".js-my_games-available-long_info").slideUp("slow");
  }

  parent.addClass("expanded");
  parent.find(".js-my_games-available-long_info").slideDown("slow");
});

$(".js-my_games").on("click", ".js-my_games-remove-game", function (e) {
  var id = $(".js-my_games-remove-game").data().id;
  removeGame(id);
  $(".js-my_games-available-item[data-id=" + id + "]").remove();
});

$(".js-my_games").on("click", ".js-my_games-edit-game", function (e) {
  var id = $(this).data().id;
  appendStep("addGameForm", $(".js-my_games-wrapper"), id);
});
