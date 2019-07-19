function initUserPageFunctions() {
  $("#userImageUpload").on("submit", function(e) {
    e.preventDefault();
    var formData = new FormData(this);
    if (
      $("#userImage")
        .val()
        .match(/.(jpg|jpeg|png|gif)$/i)
    ) {
      $.ajax({
        type: "POST",
        url: userServiceUrl,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
          $(".user-avatar-img_wrap img").attr("src", data.url);
          $(".profile-upload-image img").attr("src", data.url);
        },
        error: function(data) {
          console.log("error");
          console.log(data);
        }
      });
    } else {
      showSnackBar("Не подходящий файл для аватара.", "error");
    }
  });
  $(".js_profile-settings").on("click", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(".modal-edit_user").addClass("show");
  });
  $(".js_edit_user-form").on("submit", function(e) {
    e.preventDefault();
    var formData = getFormData(this);
    editUserData(formData);
  });

  $("#userImage").on("change", function() {
    $("#userImageUpload").submit();
  });

  $(".user_page-wrap .profile .profile-avatar").on("click", function() {
    $("#userImageUpload input").click();
  });
}

$(document).ready(function() {
  initUserPageFunctions();
});

function editUserData(formData) {
  var call = makeAjaxCall(userServiceUrl, "POST", formData, true);
  call.done(function(data) {
    $(".modal-edit_user").removeClass("show");
  });
}
