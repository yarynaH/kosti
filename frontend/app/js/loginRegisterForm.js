var authApi = "/api/user/auth";
var forgotPassApi = "/api/user/auth/forgotpass";
var googleLoginApi = "/api/user/auth/google";
var fbLoginApi = "/api/user/auth/fb";

function initLoginRegisterForm() {
  $(".js_call-login").on("click", function (e) {
    e.preventDefault();
    hideAllModals();
    $("." + $(this).data().logintype).addClass("show");
    removeScroll();
  });
  $("html").on("click", function (e) {
    hideAllModals(e);
  });
  $(document).keyup(function (e) {
    if (e.key === "Escape") {
      hideAllModals();
    }
  });
  $(".login-form").on("submit", function (e) {
    e.preventDefault();
    if (!$(".login-form").valid()) {
      return false;
    }
    showLoader();
    var call = makeAjaxCall(authApi, "POST", {
      username: $(".modal-login").find("input[name=username]").val(),
      password: $(".modal-login").find("input[name=password]").val()
    });
    call.done(function (data) {
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
  $(".register-form").on("submit", function (e) {
    e.preventDefault();
    if (!$(".register-form").valid()) {
      return false;
    }
    var call = makeAjaxCall(authApi, "PUT", {
      username: $(".modal-registration").find("input[name=username]").val(),
      password: $(".modal-registration").find("input[name=password]").val(),
      email: $(".modal-registration").find("input[name=email]").val()
    });
    showLoader();
    call.done(function (data) {
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
  $(".reset-form").on("submit", function (e) {
    e.preventDefault();
    if (!$(".reset-form").valid()) {
      return false;
    }
    showLoader();
    var call = makeAjaxCall(forgotPassApi, "POST", {
      email: $(".modal-forgot-password").find("input[name=email]").val()
    });
    call.done(function (data) {
      hideLoader();
      if (data && !data.error) {
        showSnackBar(data.message, "success");
      } else {
        showSnackBar("Что-то пошло не так.", "error");
      }
    });
  });
  $("body").on("click", ".js_modal-close", function () {
    hideAllModals();
  });
  initFBLogin();
  initVKLogin();
}

function initVKLogin() {
  $("body").on("click", ".social_login-vk", function () {
    showLoader();
  });
}

function initFBLogin() {
  $(".social_login-fb").on("click", function () {
    showLoader();
    FB.login(
      function (response) {
        var call = makeAjaxCall(
          fbLoginApi,
          "POST",
          {
            token: response.authResponse.accessToken,
            userId: response.authResponse.userID
          },
          true
        );
        call.done(function (data) {
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
      { scope: "public_profile,email", return_scopes: true }
    );
  });
}

function initGoogleLogin() {
  gapi.load("auth2", function () {
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
    function (googleUser) {
      showLoader();
      var profile = googleUser.getBasicProfile();
      var call = makeAjaxCall(
        googleLoginApi,
        "POST",
        {
          token: googleUser.getAuthResponse().id_token
        },
        true
      );
      call.done(function (data) {
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
    function (error) {}
  );
}

function hideAllModals(e) {
  if (e) {
    var modal = $(".modal.show").children(".modal-dialog").first();
    var notification = $(".js_header-notification.show_notification");
    if (modal.length > 0) {
      if ($(e.target).is($("div.modal.show"))) {
        modal.parent().removeClass("show");
        addScroll();
      }
    }
    if (notification.length > 0) {
      if (
        !$(e.target).is($(".js_notification-block")) &&
        !$(e.target).is($(".js_notification-icon"))
      ) {
        notification.removeClass("show_notification");
      }
    }
  } else {
    $("body div.modal.show").each(function () {
      $(this).removeClass("show");
    });
    $(".js_header-notification.show_notification").removeClass(
      "show_notification"
    );
    addScroll();
  }
}

function showLoader() {
  $(".js_loader").addClass("show");
  removeScroll();
}

function hideLoader() {
  $(".js_loader").removeClass("show");
  addScroll();
}

function removeScroll() {
  $("body").addClass("modal-open");
}

function addScroll() {
  $("body").removeClass("modal-open");
}
