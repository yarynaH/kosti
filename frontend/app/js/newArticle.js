window.saved = false;

$("#newArticleForm").validate({
  ignore: [],
  highlight: function (element, errorClass, validClass) {},
  unhighlight: function (element, errorClass, validClass) {}
});

$(".js_tinymce-editor").each(function () {
  initEditor($(this).data().tinymce);
});
checkSimilarArticlesAmount();
checkHashtagsAmount();

$("#newArticleForm").on("paste", "[contenteditable='true']", function (e) {
  e.preventDefault();
  var data = e.originalEvent.clipboardData.getData("text");
  data = sanitizeString(data);
  $(this).html(data);
  $(this).parent().find("input").val($(this).html().trim());
});

$("form input[type=submit]").click(function () {
  $("input[type=submit]", $(this).parents("form")).removeAttr("clicked");
  $(this).attr("clicked", "true");
});

$("#newArticleForm").on("submit", function (e) {
  e.preventDefault();
  if (!$("#newArticleForm").valid()) {
    scrollToItem($(".error-msg").parent());
    return false;
  }
  var partsLength = parseInt($(".js_single-part").length);
  var components = [];
  $(".js_single-part").each(function () {
    var part = $(this);
    if (part.hasClass("js_tinymce-editor")) {
      var value = tinymce
        .get("js_single-part-" + part.data().tinymce)
        .getContent();
      components.push({ type: "text", value: value });
    } else if (part.hasClass("js_image-editor")) {
      components.push({
        type: "part",
        descriptor: "image",
        config: {
          image: part.data().imageid,
          caption: part.find("input").val()
        }
      });
    } else if (part.hasClass("js_video-editor")) {
      if (
        part.find("img").length &&
        part.find("img").data().url &&
        part.find("img").data().url.trim() != ""
      ) {
        components.push({
          type: "part",
          descriptor: "video",
          config: { VIDEO_URL: part.find("img").data().url }
        });
      }
    } else if (part.hasClass("js_quote-editor")) {
      if (
        part.find("input").length &&
        part.find("input").val() &&
        part.find("input").val().trim() != ""
      ) {
        components.push({
          type: "part",
          descriptor: "quote",
          config: { text: part.find("input").val() }
        });
      }
    }
  });
  var data = {
    components: components,
    params: {
      similarArticles: getSimilarArticlesIds(),
      hashtags: getHashtagsIds(),
      title: $(".js_title-input").val().trim()
    },
    saveAsDraft: $("input[type=submit][clicked=true]").hasClass(
      "js_save-as-draft"
    )
  };
  var form_data = new FormData();
  if ($("#article-image-input").data().update == "true") {
    var file_data = $("#article-image-input").prop("files")[0];
    form_data.append("image", file_data);
    data.updateMainImage = "true";
  }
  if ($(".js_article-id-input").length > 0) {
    data.action = "update";
    data.id = $(".js_article-id-input").val();
  } else {
    data.action = "create";
  }
  form_data.append("data", JSON.stringify(data));
  showLoader();
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "POST",
    success: function (data) {
      hideLoader();
      if (!data.error && data.article && data.article._id) {
        window.saved = true;
        window.location = "/article/status?id=" + data.article._id;
      } else {
        showSnackBar(data.message, "error");
      }
    }
  });
});

$(".js_add-text").on("click", function () {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "textPart");
  addPart(form_data, initEditor);
});

$(".js_add-video").on("click", function () {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "videoPart");
  form_data.append("form", "true");
  addPart(form_data);
});

$(".js_add-blockquote").on("click", function () {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "blockquotePart");
  addPart(form_data);
});

$(".js_parts-block").on("click", ".js_video-editor button", function (e) {
  e.preventDefault();
  var parent = $(this).parent();
  if (parent.find("input").val().trim() == "") {
    showSnackBar("Вставьте ссылку на видео.", "error");
    return;
  }
  var form_data = new FormData();
  form_data.append("type", "videoPart");
  form_data.append("form", "false");
  form_data.append("url", parent.find("input").val());
  addPart(form_data, null, parent, true);
});

$(".js_add-image input").on("change", function (e) {
  var file_data = $(this).prop("files")[0];
  if (!validateImage(file_data)) {
    showSnackBar("Картинки такого типа не поддерживаются.", "error");
    return false;
  }
  var form_data = new FormData();
  form_data.append("file", file_data);
  form_data.append("type", "imagePart");
  addPart(form_data);
  $(this).val("");
});

$("#article-image-input").on("change", function (e) {
  var file_data = $(this).prop("files")[0];
  if (!validateImage(file_data)) {
    showSnackBar("Картинки такого типа не поддерживаются.", "error");
    return false;
  }
  showLoader();
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
    success: function (data) {
      $("#article-image-input").data("update", "true");
      $(".js_main-image").html("<img src='" + data.url + "'/>");
      hideLoader();
    }
  });
});

$(".js_parts-block").on("click", ".js_remove-part", function () {
  var btn = $(this);
  var parent = btn.parent().parent();
  if (parent.data("tinymce") !== undefined && parent.data("tinymce") !== null) {
    removeEditor(parent.data("tinymce"));
  }
  parent.remove();
});

$(".js_parts-block").on("click", ".js_move-part", function () {
  var btn = $(this);
  var parent = btn.parent().parent();
  moveElement(parent.data().id, btn.data().type);
});

function getNextId() {
  if ($(".js_single-part").length === 0) {
    return 0;
  }
  var id = $(".js_single-part").last().data().id + 1;
  while ($("js_single-part-" + id).length) {
    id++;
  }
  return id;
}

function addPart(form_data, callback, appendTo, replace) {
  if (!appendTo) {
    appendTo = $(".js_parts-block");
  }
  if (replace === undefined) {
    replace = false;
  }
  showLoader();
  var id = getNextId();
  form_data.append("id", id);
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function (data) {
      if (replace) {
        appendTo.html(data.html);
      } else {
        appendTo.append(data.html);
      }

      if (callback) {
        callback(id);
      }
      hideLoader();
    }
  });
}

function initEditor(id) {
  tinymce.init({
    selector: "#js_single-part-" + id,
    menubar: false,
    branding: false,
    statusbar: false,
    content_css: customEditorStyles,
    block_formats:
      "Параграф=p;Оглавление 2=h2;Оглавление 3=h3;Оглавление 4=h4;Оглавление 5=h5;Преформатированный=pre",
    plugins: [
      "advlist autolink lists link charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime table paste help autoresize link"
    ],
    toolbar:
      "formatselect | bold italic underline strikethrough removeformat | alignleft aligncenter alignright alignjustify | bullist numlist | subscript superscript | link",
    content_style: "pre{ white-space: normal; }"
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
    $(".js_tinymce-editor").each(function () {
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

$(".js_add-hashtag-input").on("input", function () {
  if ($(this).val()) {
    getHashTagList($(this));
  } else {
    $(".js_hashtag-suggestion-list").remove();
  }
});

$(".js_add-hashtag-input").on("focus", function () {
  if ($(this).val()) {
    getHashTagList($(this));
  } else {
    $(".js_hashtag-suggestion-list").remove();
  }
});

$(".js_add-article-input").on("input", function () {
  if ($(this).val()) {
    getArticlesList($(this));
  } else {
    $(".js_article-suggestion-list").remove();
  }
});

$(".js_add-article-input").on("focus", function () {
  if ($(this).val()) {
    getArticlesList($(this));
  } else {
    $(".js_article-suggestion-list").remove();
  }
});

function getHashTagList(el) {
  var text = el.val().trim();
  var form_data = new FormData();
  form_data.append("type", "hashtagList");
  form_data.append("q", text);
  form_data.append("ids", getHashtagsIds());
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function (data) {
      $(".js_hashtag-suggestion-wrapper").html(data.html);
    }
  });
}

function getArticlesList(el) {
  var text = el.val().trim();
  var form_data = new FormData();
  form_data.append("type", "articlesList");
  form_data.append("q", text);
  form_data.append("ids", getSimilarArticlesIds());
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function (data) {
      $(".js_article-suggestion-wrapper").html(data.html);
    }
  });
}
$(".js_similar_posts").on("click", ".js_article-suggest-item", function () {
  var el = $(this);
  var form_data = new FormData();
  form_data.append("type", "similarArticle");
  form_data.append("id", el.data().id);
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function (data) {
      $(".js_similar_posts-list").append(data.html);
      checkSimilarArticlesAmount();
    }
  });
  $(".js_article-suggestion-list").remove();
  $(".js_add-article-input").val("");
});

$(".js_similar_posts").on("click", ".js_similar_posts-item", function () {
  $(this).remove();
  checkSimilarArticlesAmount();
});

function checkSimilarArticlesAmount() {
  if ($(".js_similar_posts-item").length >= 3) {
    $(".js_add-article-input").addClass("hidden");
  } else {
    $(".js_add-article-input").removeClass("hidden");
  }
}

function checkHashtagsAmount() {
  if ($(".js_tag-item").length >= 5) {
    $(".js_add-hashtag-input").addClass("hidden");
  } else {
    $(".js_add-hashtag-input").removeClass("hidden");
  }
}

$(".js_tag-list").on("click", ".js_hashtag-suggest-item", function () {
  var form_data = new FormData();
  form_data.append("type", "hashtag");
  form_data.append("q", $(this).text().trim());
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function (data) {
      $(data.html).insertBefore($(".js_add-hashtag-input-wrapper"));
      checkHashtagsAmount();
    }
  });
  $(".js_hashtag-suggestion-list").remove();
  $(".js_add-hashtag-input").val("");
});

$(".js_tag-list").on("click", ".js_tag-item", function () {
  $(this).remove();
  checkHashtagsAmount();
});

$(".js_title-div").on("input", function () {
  var data = sanitizeString($(this).text().trim());
  $(".js_title-input").val(data);
});

$(".js_parts-block").on("input", ".js_img_caption", function () {
  var data = sanitizeString($(this).text().trim());
  $(this).parent().find(".js_img_caption_input").val(data);
});

$(".js_title-div").on("focus", function () {
  $(this).text($(".js_title-input").val());
});

$(".js_parts-block").on("focus", ".js_editable-div", function () {
  var input = $(this).parent().find("input.js_editable-div-value");
  $(this).text(input.val());
});

$(".js_parts-block").on("focusout", ".js_editable-div", function () {
  checkPlaceholder(this);
});

$(".js_parts-block").on("input", ".js_editable-div", function () {
  var input = $(this).parent().find("input.js_editable-div-value");
  input.val($(this).text().trim());
});

function checkPlaceholder(el) {
  el = $(el);
  if (el.text().trim() === "") {
    el.text(el.data().placeholder);
  }
}

$(".js_parts-block").on("focus", ".js_img_caption", function () {
  $(this).text($(this).parent().find(".js_img_caption_input").val());
});

function getHashtagsIds() {
  var hashtags = [];
  $(".js_tag-item").each(function () {
    var hashtag = $(this);
    hashtags.push(hashtag.data().id);
  });
  return hashtags;
}

function getSimilarArticlesIds() {
  var similarArticles = [];
  $(".js_similar_posts-item").each(function () {
    var similarArticle = $(this);
    similarArticles.push(similarArticle.data().id);
  });
  return similarArticles;
}

function validateImage(img) {
  var acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return img && acceptedImageTypes.includes(img["type"]);
}

$(window).bind("beforeunload", function () {
  if (!window.saved) {
    return "Не сохраненные изменения будут утеряны.";
  }
});
