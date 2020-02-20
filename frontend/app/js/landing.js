function initCountdown() {
  if (
    $("#days").length &&
    $("#hours").length &&
    $("#minutes").length &&
    $("#seconds").length
  ) {
    (function() {
      countdown("05/21/2020 06:00:00 PM");
    })();
  }
}

function initLandingScripts() {
  $(".js_landing-subscribe-form").on("submit", function(e) {
    e.preventDefault();
    if (!$(this).valid()) {
      return false;
    }
    var email = $(this)
      .find("input[name=email]")
      .val();
    $.ajax({
      url: "",
      type: "POST",
      async: false,
      data: { email: email, lang: lang },
      success: function(data) {
        console.log(data);
        showSnackBar(data.text, "kosticon2020");
      }
    });
  });
  $(".js_landing-subscribe-form").validate({
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {}
  });
}

$(document).ready(function() {
  initCountdown();
  initLandingScripts();
});

function countdown(endDate) {
  var days, hours, minutes, seconds;

  endDate = new Date(endDate).getTime();

  if (isNaN(endDate)) {
    return;
  }

  setInterval(calculate, 1000);

  function calculate() {
    var startDate = new Date();
    startDate = startDate.getTime();

    var timeRemaining = parseInt((endDate - startDate) / 1000);

    if (timeRemaining >= 0) {
      days = parseInt(timeRemaining / 86400);
      timeRemaining = timeRemaining % 86400;

      hours = parseInt(timeRemaining / 3600);
      timeRemaining = timeRemaining % 3600;

      minutes = parseInt(timeRemaining / 60);
      timeRemaining = timeRemaining % 60;

      seconds = parseInt(timeRemaining);

      $("#days").text(parseInt(days, 10));
      $("#hours").text(("0" + hours).slice(-2));
      $("#minutes").text(("0" + minutes).slice(-2));
      $("#seconds").text(("0" + seconds).slice(-2));
    }
  }
}
