var commentsWrapper = $(".js_article-comments, .blog-list");

function initComments() {
  $(".js_comment-form").each(function () {
    $(this).validate({
      highlight: function (element, errorClass, validClass) {},
      unhighlight: function (element, errorClass, validClass) {}
    });
  });
  if (commentsWrapper.length > 0) {
    commentsWrapper.on("click", ".js_answer-comment", function (e) {
      $("form[data-parentid=" + $(this).data("id") + "]").toggleClass("hidden");
    });
    commentsWrapper.on("submit", ".js_comment-form", function (e) {
      e.preventDefault();
      if (!checkUserLoggedIn()) {
        showLogin(e);
      } else {
        var form = $(this);
        if (form.valid()) {
          var formData = {};
          $.each($(this).serializeArray(), function () {
            formData[this.name] = this.value;
          });
          addComment(this, formData);
        }
      }
    });
    commentsWrapper.on("keydown", "textarea", function (e) {
      if (e.ctrlKey && e.keyCode == 13) {
        if (!checkUserLoggedIn()) {
          showLogin(e);
        } else {
          var form = $(this).closest("form");
          if (form.valid()) {
            var formData = {};
            $.each(form.serializeArray(), function () {
              formData[this.name] = this.value;
            });
            addComment(form, formData);
          }
        }
      }
    });
    $(".js_remove_comment-form").on("submit", function (e) {
      e.preventDefault();
      if (!checkUserLoggedIn()) {
        showLogin(e);
      } else {
        var formData = {};
        $.each($(this).serializeArray(), function () {
          formData[this.name] = this.value;
        });
        removeComment(formData);
      }
    });
    commentsWrapper.on("click", ".js_comment-like", function (e) {
      e.preventDefault();
      if (!checkUserLoggedIn()) {
        showLogin(e);
      } else {
        likeComment(this);
      }
    });
    commentsWrapper.on("click", ".js_comment-remove_btn", function (e) {
      if (!checkUserLoggedIn()) {
        showLogin(e);
      } else {
        showRemoveFunction(this, e, "remove");
      }
    });
    commentsWrapper.on("click", ".js_report-comment", function (e) {
      if (!checkUserLoggedIn()) {
        showLogin(e);
      } else {
        showRemoveFunction(this, e, "report");
      }
    });
  }
}

function likeComment(el) {
  var data = {
    action: "vote",
    id: $(el).data("contentid")
  };
  var call = makeAjaxCall(commentsServiceUrl, "POST", data, true);
  call.done(function (data) {
    $(el).text(data.rate);
    if (data.voted) {
      $(el).addClass("active");
    } else {
      $(el).removeClass("active");
    }
  });
}

function addComment(el, formData) {
  var parentId = $(el).data("parentid")
    ? $(el).data("parentid")
    : $(".js_article-id").data("articleid");
  var data = {
    body: formData.body,
    parent: parentId,
    articleId: $(".js_article-id").data("articleid"),
    action: "addComment"
  };
  var call = makeAjaxCall(commentsServiceUrl, "POST", data, true);
  call.done(function (data) {
    if (parentId != $(".js_article-id").data("articleid")) {
      $("form[data-parentid=" + parentId + "]").addClass("hidden");
    }
    if (
      parentId == $(".js_article-id").data("articleid") &&
      !$("ul.js_comments-list[data-parentid=" + parentId + "]").length
    ) {
      commentsWrapper.append(
        '<ul class="comments-list js_comments-list" data-parentid="' +
          parentId +
          '"></ul>'
      );
    } else if (
      !$("ul.js_comments-list[data-parentid=" + parentId + "]").length
    ) {
      $("li.js_comment[data-id=" + parentId + "]").append(
        '<ul class="comments-list js_comments-list" data-parentid="' +
          parentId +
          '"></ul>'
      );
    }
    $("ul.js_comments-list[data-parentid=" + parentId + "]").append(data);
    $("form[data-parentid=" + parentId + "] textarea").val("");

    var scroll_value =
      $(".js_comment_scroll").offset().top - window.innerHeight / 2;
    $("html, body").scrollTop(scroll_value);

    $(".js_comment").removeClass("js_comment_scroll");
  });
}

function showRemoveFunction(el, e, action) {
  e.stopPropagation();
  $(".modal-remove_comment").addClass("show");
  $("input.js_comment-remove-id").val($(el).data("id"));
  $("input.js_comment-remove-action").val(action);
}

function removeComment(formData) {
  var data = {
    action: formData.action,
    id: formData.id,
    reason: formData.reason
  };
  var call = makeAjaxCall(commentsServiceUrl, "POST", data, true);
  call.done(function (data) {
    $("input.js_comment-remove-id").val("");
    $(".modal-remove_comment").removeClass("show");
    if (data.deleted === true) {
      $("li[data-id=" + formData.id + "] > .comments-body")
        .addClass("deleted")
        .text("Комментарий удален");
      $(el).remove();
    }
  });
}

$(document).ready(function () {
  initComments();
});
