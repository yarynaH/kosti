var imageApi = "/api/user/image";
var userApi = "/api/user";

function initUserPageFunctions() {
  $("#userImageUpload").on("submit", function (e) {
    e.preventDefault();
    var formData = new FormData(this);
    if (
      $("#userImage")
        .val()
        .match(/.(jpg|jpeg|png|gif)$/i)
    ) {
      showLoader();
      $.ajax({
        type: "POST",
        url: imageApi,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
          $(".user-avatar-img_wrap img").attr("src", data.url);
          $(".profile-upload-image img").attr("src", data.url);
          hideLoader();
        },
        error: function (data) {
          hideLoader();
        }
      });
    } else {
      showSnackBar("Не подходящий файл для аватара.", "error");
    }
  });
  $(".js_profile-settings").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(".modal-edit_user").addClass("show");
    removeScroll();
  });
  $(".js_edit_user-form").on("submit", function (e) {
    e.preventDefault();
    showLoader();
    var formData = getFormData(this);
    editUserData(formData);
  });

  $("#userImage").on("change", function () {
    $("#userImageUpload").submit();
  });

  $(".user_page-wrap .profile .profile-avatar").on("click", function () {
    $("#userImageUpload input").click();
  });
}

$(document).ready(function () {
  initUserPageFunctions();
});

function editUserData(formData) {
  var call = makeAjaxCall(userApi, "POST", formData, true);
  call.done(function (data) {
    $(".modal-edit_user").removeClass("show");
    hideLoader();
  });
}
