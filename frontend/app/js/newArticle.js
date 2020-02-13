$(".js_new-part-dropdown").on("click", function() {
  $(".js_dropdown-content").toggleClass("hidden");
});

$(".js_new-part").on("click", function() {
  $(".js_dropdown-content").addClass("hidden");
});

$("#newArticleForm").validate({
  ignore: [],
  highlight: function(element, errorClass, validClass) {},
  unhighlight: function(element, errorClass, validClass) {}
});

$("#newArticleForm").on("submit", function(e) {
  e.preventDefault();
  if (!$("#newArticleForm").valid()) {
    return false;
  }
  var partsLength = parseInt($(".js_single-part").length);
  var result = [];
  $(".js_single-part").each(function() {
    var part = $(this);
    if (part.hasClass("tinymce-editor")) {
      var value = tinymce
        .get("js_single-part-" + part.data().tinymce)
        .getContent();
      result.push({ type: "text", value: value });
    } else if (part.hasClass("image-editor")) {
      result.push({
        type: "image",
        value: part.data().imageid,
        caption: part.find("input").val()
      });
    }
  });
  var data = {
    components: result,
    params: {
      intro: $(".js_intro-input")
        .val()
        .trim(),
      title: $(".js_title-input")
        .val()
        .trim()
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

$(".js_add-text").on("click", function() {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "textPart");
  addPart(form_data, initEditor);
});

$(".js_add-image input").on("change", function(e) {
  var file_data = $(this).prop("files")[0];
  var form_data = new FormData();
  form_data.append("file", file_data);
  form_data.append("type", "imagePart");
  addPart(form_data);
  $(this).val("");
});

$("#article-image-input").on("change", function(e) {
  var file_data = $(this).prop("files")[0];
  var form_data = new FormData();
  form_data.append("file", file_data);
  form_data.append("json", "true");
  form_data.append("type", "imageMain");
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function(data) {
      $(".js_main-image").html("<img src='" + data.url + "'/>");
    }
  });
});

$(".js_parts-block").on("click", ".js_remove-part", function() {
  var btn = $(this);
  var parent = btn.parent();
  if (parent.data("tinymce") !== undefined && parent.data("tinymce") !== null) {
    removeEditor(parent.data("tinymce"));
  }
  parent.remove();
});

$(".js_parts-block").on("click", ".js_move-part", function() {
  var btn = $(this);
  var parent = btn.parent();
  moveElement(parent.data().id, btn.data().type);
});

function getNextId() {
  if ($(".js_single-part").length === 0) {
    return 0;
  }
  var id =
    $(".js_single-part")
      .last()
      .data().id + 1;
  while ($("js_single-part-" + id).length) {
    id++;
  }
  return id;
}

function addPart(form_data, callback) {
  var id = getNextId();
  form_data.append("id", id);
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function(data) {
      $(".js_parts-block").append(data.html);
      if (callback) {
        callback(id);
      }
    }
  });
}

function initEditor(id) {
  tinymce.init({
    selector: "#js_single-part-" + id,
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

function moveElement(id, direction) {
  var el = $(".js_single-part-" + id);
  var el2 = null;
  if (direction === "top") {
    el2 = el.prev();
    if (el2.length) {
      el2.insertAfter(el);
    }
  } else if (direction === "bot") {
    el2 = el.next();
    if (el2.length) {
      el2.insertBefore(el);
    }
  }
  if (el2.length) {
    $(".tinymce-editor").each(function() {
      reinitializeEditor($(this).data().id);
    });
  }
}

function reinitializeEditor(id) {
  removeEditor(id);
  initEditor(id);
}

function removeEditor(id) {
  tinymce.remove("js_single-part-" + id);
  if (tinymce.get("js_single-part-" + id)) {
    tinymce.get("js_single-part-" + id).destroy();
  }
}

$(".js_title-div").on("input", function() {
  $(".js_title-input").val(
    $(this)
      .text()
      .trim()
  );
});

$(".js_intro-div").on("input", function() {
  $(".js_intro-input").val(
    $(this)
      .text()
      .trim()
  );
});

$(".js_intro-div").on("focus", function() {
  $(this).text($(".js_intro-input").val());
});

$(".js_title-div").on("focus", function() {
  $(this).text($(".js_title-input").val());
});
