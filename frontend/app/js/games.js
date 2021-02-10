var gamesFilterUrl = "/api/festival/games/list";

function initGamesScripts() {
  if ($(window).width() < 768) {
    $(".js-k_games-filters-btn").on("click", function () {
      $(this).toggleClass("open");
      $(".js-k_games-filters-list").slideToggle("slow");
    });
  }

  $(".js_festival-filter-select").on("change", function () {
    getFilteredGames();
  });

  $(".js-custom_select").on("click", ".js-custom_select-button", function (e) {
    $(this).parent().toggleClass("show");
  });

  var selected_arr = [];
  var games_i = 0;

  $(".js-custom_select").on("click", ".js-custom_select-option", function () {
    var val = $(this).data("value");
    var text = $(this).text();

    if (selected_arr.indexOf(val) === -1) {
      selected_arr[games_i] = val;
      addSelectedOption(val, text);
      games_i++;
    }

    $(".js-custom_select-placeholder").hide();
  });

  $(".js-custom_select").on(
    "click",
    ".js-custom_select-selected",
    function (e) {
      e.stopPropagation();
      var val = $(this).data("value");
      var index = selected_arr.indexOf(val);

      if (index > -1) {
        selected_arr.splice(index, 1);
      }

      $(".js-custom_select-selected[data-value=" + val + "]").remove();
      games_i--;

      if (selected_arr.length === 0) {
        $(".js-custom_select-placeholder").show();
      }
      getFilteredGames();
    }
  );

  $(document).on("click", function (e) {
    var el = $(".js-custom_select");
    if (!el.is(e.target) && el.has(e.target).length === 0) {
      el.removeClass("show");
    }
  });
}

function getFilteredGames() {
  showLoader();
  var data = {
    theme: []
  };
  $(".js_festival-filter-select").each(function () {
    data[$(this).attr("name")] = $(this).val();
  });
  $(".js_festival-filter-multiselect").each(function () {
    data.theme.push($(this).data().value);
  });
  $.ajax({
    url: gamesFilterUrl,
    data: data,
    type: "GET",
    success: function (data) {
      hideLoader();
    },
    error: function (data) {
      hideLoader();
    }
  });
}

function addSelectedOption(val, text) {
  $(
    "<span class='js-custom_select-selected custom_select-selected_item js_festival-filter-multiselect' data-value='" +
      val +
      "'>" +
      text +
      "<i class='icon-delete'></i></span>"
  ).appendTo(".js-custom_select-button");
  getFilteredGames();
}

$(document).ready(function () {
  initGamesScripts();
});
