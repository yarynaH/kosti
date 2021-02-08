function initGamesScripts() {
  $(".js-custom_select-button").on("click", function() {
    $(this)
    .parent()
    .toggleClass("show");
  });

  $(".js-custom_select-option").on("click", function() {
    var val =$(this).data("value");
    var text =$(this).text();
    var selected_arr=$(".js-custom_select-selected");
    if (selected_arr.length === 0) {
      addSelectedOption(val,text);
    } else {
      for (let i = 0; i < selected_arr.length; i++) {
        if($(selected_arr[i]).data("value") !== val) {
          addSelectedOption(val,text);
        }
      }
    }

    if($(".js-custom_select").find(".js-custom_select-selected").length !== 0) {
      $(".js-custom_select-placeholder").hide();
    } else {
      $(".js-custom_select-placeholder").show();
    }
    
  });
}

function addSelectedOption(val,text) {
  $("<span class='js-custom_select-selected custom_select-selected_item' data-value='" + val + "'>" + text + "<i class='icon-delete'></i></span>")
    .appendTo(".js-custom_select-button");
}

$(document).ready(function () {
  initGamesScripts();
});
