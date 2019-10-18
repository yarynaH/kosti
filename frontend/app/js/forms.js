function initFormEvents() {
  $(".js_form-show-description").on("click", function(e) {
    e.stopPropagation();
    $(".js_form-info .modal-body").html($(this).data().description);
    $(".js_form-info .modal-title").html($(this).data().title);
    $(".js_form-info").addClass("show");
  });
  $("input[type=checkbox]").on("click", function(e) {
    var curr = this;
    $(this)
      .parent()
      .parent()
      .parent()
      .find("input[type=checkbox]:checked")
      .each(function() {
        if (this != curr) {
          $(this).prop("checked", false);
        }
      });
  });
  $("main.form button[type=submit]").on("click", function(e) {
    if (!checkUserLoggedIn()) {
      e.preventDefault();
      showLogin(e);
    }
    /*
    var availableSeats = legendary ? 2 : 1;
    if ($("main.form [type=checkbox]:checked").length > availableSeats) {
      e.preventDefault();
      $("form .invalid-qauntity").removeClass("hidden");
    } else {
      $("form .invalid-qauntity").addClass("hidden");
    }
    
    $("input[type=checkbox]:checked").each(function() {
      if (!checkSpace(this)) {
        $("form .invalid-space").removeClass("hidden");
        e.preventDefault();
      } else {
        $("form .invalid-space").addClass("hidden");
      }
    });
    $("main.form input[type=text]").each(function() {
      if ($(this).val() == "") {
        e.preventDefault();
        $(this).addClass("is-invalid");
        $("form .invalid-input").removeClass("hidden");
      } else {
        $(this).removeClass("is-invalid");
        $("form .invalid-input").addClass("hidden");
      }
    });
    */
  });
}

function checkSpace(el) {
  var data = {
    action: "checkspace",
    name: $(el).val(),
    game: $(el).attr("name")
  };
  var result;
  $.ajax({
    url: "/_/service/com.myurchenko.kostirpg/form",
    type: "POST",
    async: false,
    data: data,
    success: function(serverData) {
      if (serverData.space >= space[data.game][data.name]) {
        result = false;
      } else {
        result = true;
      }
    }
  });
  return result;
}

var reloadAfterLogin = false;
$(document).ready(function() {
  if ($("main.form").length > 0) {
    initFormEvents();
  }
});
