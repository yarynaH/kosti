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
  var file_data = $("#article-image-input").prop("files")[0];
  var partsLength = parseInt($(".js_single-part").length);
  var components = [];
  $(".js_single-part").each(function() {
    var part = $(this);
    if (part.hasClass("js_tinymce-editor")) {
      var value = tinymce
        .get("js_single-part-" + part.data().tinymce)
        .getContent();
      components.push({ type: "text", value: value });
    } else if (part.hasClass("js_image-editor")) {
      components.push({
        type: "image",
        value: part.data().imageid,
        caption: part.find("input").val()
      });
    }
  });
  var data = {
    components: components,
    params: {
      similarArticles: getSimilarArticlesIds(),
      hashtags: getHashtagsIds(),
      intro: $(".js_intro-input")
        .val()
        .trim(),
      title: $(".js_title-input")
        .val()
        .trim()
    }
  };
  var form_data = new FormData();
  form_data.append("image", file_data);
  form_data.append("data", JSON.stringify(data));
  showLoader();
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "POST",
    success: function(data) {
      hideLoader();
      if (!data.error && data.article && data.article._id) {
        window.location = "/article/edit?id=" + data.article._id;
      } else {
        showSnackBar(data.message, "error");
      }
    }
  });
});

$(".js_add-text").on("click", function() {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "textPart");
  addPart(form_data, initEditor);
});

$(".js_add-video").on("click", function() {
  var id = getNextId();
  var form_data = new FormData();
  form_data.append("type", "videoPart");
  form_data.append("form", "true");
  addPart(form_data);
});

$(".js_add-image input").on("change", function(e) {
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

$("#article-image-input").on("change", function(e) {
  var file_data = $(this).prop("files")[0];
  if (!validateImage(file_data)) {
    showSnackBar("Картинки такого типа не поддерживаются.", "error");
    return false;
  }
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
  var parent = btn.parent().parent();
  if (parent.data("tinymce") !== undefined && parent.data("tinymce") !== null) {
    removeEditor(parent.data("tinymce"));
  }
  parent.remove();
});

$(".js_parts-block").on("click", ".js_move-part", function() {
  var btn = $(this);
  var parent = btn.parent().parent();
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
      "insertdatetime table paste help autoresize"
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
    $(".js_tinymce-editor").each(function() {
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

$(".js_add-hashtag-input").on("input", function() {
  if ($(this).val()) {
    getHashTagList($(this));
  } else {
    $(".js_hashtag-suggestion-list").remove();
  }
});

$(".js_add-hashtag-input").on("focus", function() {
  if ($(this).val()) {
    getHashTagList($(this));
  } else {
    $(".js_hashtag-suggestion-list").remove();
  }
});

$(".js_add-article-input").on("input", function() {
  if ($(this).val()) {
    getArticlesList($(this));
  } else {
    $(".js_article-suggestion-list").remove();
  }
});

$(".js_add-article-input").on("focus", function() {
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
    success: function(data) {
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
    success: function(data) {
      $(".js_article-suggestion-wrapper").html(data.html);
    }
  });
}
$(".js_similar_posts").on("click", ".js_article-suggest-item", function() {
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
    success: function(data) {
      $(".js_similar_posts-list").append(data.html);
      checkSimilarArticlesAmount();
    }
  });
  $(".js_article-suggestion-list").remove();
  $(".js_add-article-input").val("");
});

$(".js_similar_posts").on("click", ".js_similar_posts-item", function() {
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
  if ($(".js_tag-item").length >= 6) {
    $(".js_add-hashtag-input").addClass("hidden");
  } else {
    $(".js_add-hashtag-input").removeClass("hidden");
  }
}

$(".js_tag-list").on("click", ".js_hashtag-suggest-item", function() {
  var form_data = new FormData();
  form_data.append("type", "hashtag");
  form_data.append(
    "q",
    $(this)
      .text()
      .trim()
  );
  $.ajax({
    url: "/create",
    data: form_data,
    processData: false,
    contentType: false,
    type: "PUT",
    success: function(data) {
      $(data.html).insertBefore($(".js_add-hashtag-input"));
      checkHashtagsAmount();
    }
  });
  $(".js_hashtag-suggestion-list").remove();
  $(".js_add-hashtag-input").val("");
});

$(".js_tag-list").on("click", ".js_tag-item", function() {
  $(this).remove();
  checkHashtagsAmount();
});

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

$(".js_parts-block").on("input", ".js_img_caption", function() {
  $(this)
    .parent()
    .find(".js_img_caption_input")
    .val(
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

$(".js_parts-block").on("focus", ".js_img_caption", function() {
  $(this).text(
    $(this)
      .parent()
      .find(".js_img_caption_input")
      .val()
  );
});

function getHashtagsIds() {
  var hashtags = [];
  $(".js_tag-item").each(function() {
    var hashtag = $(this);
    hashtags.push(hashtag.data().id);
  });
  return hashtags;
}

function getSimilarArticlesIds() {
  var similarArticles = [];
  $(".js_similar_posts-item").each(function() {
    var similarArticle = $(this);
    similarArticles.push(similarArticle.data().id);
  });
  return similarArticles;
}

function validateImage(img) {
  var acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return img && acceptedImageTypes.includes(img["type"]);
}