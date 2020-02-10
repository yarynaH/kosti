$(".js_new-part-dropdown").on("click", function() {
  $(".js_dropdown-content").toggleClass("hidden");
});

$(".js_new-part").on("click", function() {
  $(".js_dropdown-content").addClass("hidden");
});

$("#newArticleForm").validate({
  ignore: ""
});

$("#newArticleForm").on("submit", function(e) {
  e.preventDefault();
  var partsLength = parseInt($(".js_single-part").length);
  var result = [];
  for (var i = 0; i < partsLength; i++) {
    var part = $(".js_single-part-" + i);
    if (part.hasClass("tinymce-editor")) {
      var value = tinymce.get("js_single-part-" + i).getContent();
      result.push({ type: "text", value: value });
    } else if (part.hasClass("image-editor")) {
      result.push({ type: "image", value: part.data().id });
    }
  }
  var data = {
    components: result,
    params: {
      intro: $("#article-intro-input").val(),
      title: $("#article-title-input").val()
    }
  };
  var file_data = $("#article-image-input").prop("files")[0];
  var form_data = new FormData();
  form_data.append("image", file_data);
  form_data.append("data", JSON.stringify(data));
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "POST",
    success: function(data) {
      showSnackBar(data.message, data.error ? "error" : "success");
    }
  });
});

$(".js_add-block").on("click", function() {
  var id = $(".js_single-part").length;
  $(".js_parts-block").append(
    '<div class="form-group"><textarea class="tinymce-editor js_single-part js_single-part-' +
      id +
      '" id="js_single-part-' +
      id +
      '"></textarea></div>'
  );
  initEditor(id);
});

$(".js_add-image input").on("change", function(e) {
  var file_data = $(this).prop("files")[0];
  var id = $(".js_single-part").length;
  var form_data = new FormData();
  form_data.append("file", file_data);
  form_data.append("id", id);
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function(data) {
      $(".js_parts-block").append(data.image);
    }
  });
  $(this).val("");
});

$("#article-image-input").on("change", function(e) {
  var file_data = $(this).prop("files")[0];
  var form_data = new FormData();
  form_data.append("file", file_data);
  form_data.append("json", true);
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function(data) {
      $(".js_main-image img").attr("src", data.url);
      console.log(data);
    }
  });
});

function initEditor(id) {
  tinymce.init({
    selector: ".js_single-part-" + id,
    menubar: false,
    branding: false,
    statusbar: false,
    plugins: [
      "advlist autolink lists link charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime table paste code help autoresize"
    ],
    toolbar:
      "formatselect | bold italic removeformat | alignleft aligncenter alignright alignjustify | bullist numlist"
  });
}
