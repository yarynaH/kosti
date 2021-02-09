function initGamesScripts() {
  $(".js-custom_select-button").on("click", function() {
    $(this)
    .parent()
    .toggleClass("show");
  });

  var selected_arr=[];
  var games_i = 0;
  $(".js-custom_select-option").on("click", function() {
    var val =$(this).data("value");
    var text =$(this).text();
      if (selected_arr.indexOf(val) === -1) {
        selected_arr[games_i]=val;
        addSelectedOption(val,text);
        games_i++;
      }

    if($(".js-custom_select").find(".js-custom_select-selected").length !== 0) {
      $(".js-custom_select-placeholder").hide();
    } else {
      $(".js-custom_select-placeholder").show();
    }
    console.log(selected_arr);
  });

  $(".js-custom_select-selected").on("click", function() {
    console.log("ccc");
    var val =$(this).data("value");
    var index =selected_arr.indexOf(val);
    if (index > -1) {
      selected_arr.splice(index, 1);
    }
    $(".js-custom_select-selected").data("value=" + val).remove();
    console.log("value=" + val);
    console.log(selected_arr);
  })
}

function addSelectedOption(val,text) {
  $("<span class='js-custom_select-selected custom_select-selected_item' data-value='" + val + "'>" + text + "<i class='icon-delete'></i></span>")
    .appendTo(".js-custom_select-button");
}

$(document).ready(function () {
  initGamesScripts();
});
