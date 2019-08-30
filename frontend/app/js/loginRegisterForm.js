function initLoginRegisterForm() {
  $(".js_header-user .guest-btn").on("click", function(e) {
    showLogin(e);
  });
  $(document).on("click", function(event) {
    hideLoginRegisterModal();
  });
  $(document).keyup(function(e) {
    if (e.key === "Escape") {
      hideLoginRegisterModal();
    }
  });
  $(".modal-action-register").on("click", function(e) {
    e.preventDefault();
    hideLoginRegisterModal();
    $(".modal-registration").addClass("show");
  });
  $(".modal-action-login").on("click", function(e) {
    e.preventDefault();
    hideLoginRegisterModal();
    $(".modal-login").addClass("show");
  });
  $(".modal-action-forgotpass").on("click", function(e) {
    e.preventDefault();
    hideLoginRegisterModal();
    $(".modal-forgot-password").addClass("show");
  });
  $(".reset-form").on("submit", function(e) {
    e.preventDefault();
    if (!$(".reset-form").valid()) {
      return false;
    }
    showLoader();
    var data = {
      email: $(".modal-forgot-password")
        .find("input[name=email]")
        .val(),
      action: "forgotpass"
    };
    var request = $.ajax({
      url: userServiceUrl,
      method: "POST",
      data: data
    }).done(function(data) {
      hideLoader();
      if (data && !data.error) {
        showSnackBar(data.message, "success");
      } else {
        showSnackBar("Что-то пошло не так.", "error");
      }
    });
  });
  $(".login-form").on("submit", function(e) {
    e.preventDefault();
    if (!$(".login-form").valid()) {
      return false;
    }
    showLoader();
    var data = {
      username: $(".modal-login")
        .find("input[name=username]")
        .val(),
      password: $(".modal-login")
        .find("input[name=password]")
        .val(),
      action: "login"
    };
    var request = $.ajax({
      url: userServiceUrl,
      method: "POST",
      data: data
    }).done(function(data) {
      if (!data.exist && !data.html) {
        hideLoader();
        $(".modal-login .form-group-error").text(data.message);
        $(".modal-login .form-group-error").removeClass("hidden");
      } else {
        $(".js_header-user-wrap").html(data.html);
        $(".modal-login .form-group-error").addClass("hidden");
        location.reload();
      }
    });
  });
  $(".modal-content, .js_header-notification").on("click", function(e) {
    e.stopPropagation();
  });
  $(".register-form").on("submit", function(e) {
    e.preventDefault();
    if (!$(".register-form").valid()) {
      return false;
    }
    var data = {
      username: $(".modal-registration")
        .find("input[name=username]")
        .val(),
      password: $(".modal-registration")
        .find("input[name=password]")
        .val(),
      email: $(".modal-registration")
        .find("input[name=email]")
        .val(),
      action: "register"
    };
    if (!validateEmail(data.email)) {
      $(".modal-registration .form-group-error").text("Неправильный емейл");
      $(".modal-registration .form-group-error").removeClass("hidden");
      return false;
    } else {
      $(".modal-registration .form-group-error").addClass("hidden");
    }
    showLoader();
    var request = $.ajax({
      url: userServiceUrl,
      method: "POST",
      data: data
    }).done(function(data) {
      if (data.authenticated) {
        $(".modal-registration .form-group-error").addClass("hidden");
        $(".js_header-user-wrap").html(data.html);
        location.reload();
      } else if (data.exist) {
        $(".modal-registration .form-group-error").text(data.message);
        $(".modal-registration .form-group-error").removeClass("hidden");
        hideLoader();
      }
    });
  });
  $(".login-form").validate({
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {}
  });
  $(".register-form").validate({
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {}
  });
  $(".reset-form").validate({
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {}
  });
}

function initGoogleLogin() {
  gapi.load("auth2", function() {
    auth2 = gapi.auth2.init({
      client_id:
        "677318802177-6qjftg5h6fdtcvjs9d500blu50jmu8cj.apps.googleusercontent.com",
      cookiepolicy: "single_host_origin"
    });
    attachSignin(document.getElementById("google-login"));
  });
}

function attachSignin(element) {
  var googleUser = {};
  auth2.attachClickHandler(
    element,
    {},
    function(googleUser) {
      showLoader();
      var profile = googleUser.getBasicProfile();
      var call = makeAjaxCall(
        userServiceUrl,
        "POST",
        {
          action: "googleRegister",
          token: googleUser.getAuthResponse().id_token
        },
        true
      );
      call.done(function(data) {
        if (data.authenticated && data.exist) {
          $(".js_header-user-wrap").html(data.html);
          $(".modal-login .form-group-error").addClass("hidden");
          location.reload();
        } else {
          $(".modal-login .form-group-error").text(data.message);
          $(".modal-login .form-group-error").removeClass("hidden");
          hideLoader();
        }
      });
    },
    function(error) {}
  );
}

function hideLoginRegisterModal() {
  $("body div.modal").each(function() {
    $(this).removeClass("show");
  });
  $(".js_header-notification").removeClass("show_notification");
}

function showLoader() {
  $(".js_loader").addClass("show");
}

function hideLoader() {
  $(".js_loader").removeClass("show");
}
