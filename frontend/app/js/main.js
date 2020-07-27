var loadMoreRequest = null;

function initPDPFunctions() {
  $(".qty-decrement").on("click", function () {
    var selector = ".qty-input[data-id=" + $(this).data().id + "]";
    $(this).data().size
      ? (selector += "[data-size=" + $(this).data().size + "]")
      : false;
    var input = $(selector);
    input.val(Math.max(parseInt(input.val()) - 1, 1));
    if ($(".cart-list").length > 0) {
      addToCartOnclick(input);
    }
  });
  $(".qty-input").on("change", function () {
    var input = $(this);
    if (isNaN(parseInt(input.val())) || parseInt(input.val()) < 1) {
      input.val("1");
    }
    input.val(Math.max(parseInt(input.val()), 1));
    if ($(".cart-list").length > 0) {
      addToCartOnclick(input);
    }
  });
  $(".qty-increment").on("click", function () {
    var selector = ".qty-input[data-id=" + $(this).data().id + "]";
    $(this).data().size
      ? (selector += "[data-size=" + $(this).data().size + "]")
      : false;
    var input = $(selector);
    input.val(Math.max(parseInt(input.val()) + 1, 1));
    if ($(".cart-list").length > 0) {
      addToCartOnclick(input);
    }
  });
  $(".add_to_cart-btn").on("click", function (e) {
    e.preventDefault();
    if ($("#pdp-size-select").length && !$("#pdp-size-select").val()) {
      $("#pdp-size-select").addClass("is-invalid");
    } else {
      $("#pdp-size-select").removeClass("is-invalid");
      addToCart();
    }
  });
  $("#pdp-size-select").on("change", function () {
    $(".pdp-validation").addClass("hidden");
    $("#pdp-size-select").removeClass("is-invalid");
  });
  if (typeof pdpImageUrl !== "undefined") {
    if (window.outerWidth >= 768) {
      $(".pdp-main_image").zoom({ url: pdpImageUrl });
    }
  }
}

function initCheckoutEvents() {
  $("#phone-checkout-input").on("change paste keyup", function () {
    $("#phone-checkout-input").val(
      $("#phone-checkout-input").val().replace(/\D+/g, "")
    );
  });
}

function initSharedEvents() {
  $("body").on("click", ".js_login-required", function (e) {
    if (!checkUserLoggedIn()) {
      e.preventDefault();
      showLogin(e);
    }
  });
  snackBarClose.on("click", function () {
    resetSnackBar();
  });
  setCookie(cartId);
  $(
    ".similar_posts, .blog-list, .article-body, .blog-sidebar, .js_homepage_slider"
  ).on("click", ".js_like-article", function (e) {
    e.preventDefault();
    if (checkUserLoggedIn()) {
      doUpvote(this);
    } else {
      showLogin(e);
    }
  });
  $("body").on("click", ".js_copy_url", function (e) {
    e.preventDefault();
    var data = $(this).data();
    copyStringToClipboard(data.url);
    showSnackBar("Ссылка скопирована.", "success");
  });

  $("body").on("click", "a.social-link.facebook", function (e) {
    var data = $(this).data();
    if (!data.description) {
      data.description = "";
    }
    shareOverrideOGMeta(
      data.url,
      data.title,
      data.description.replace(/(&nbsp;|(<([^>]+)>))/gi, ""),
      data.image,
      data.articleid,
      "facebook",
      data.itemtype
    );
  });
  $("a.social-link.twitter").on("click", function (e) {
    var data = $(this).data();
    incrementShare(
      data.articleid,
      getCookieValue("cartId"),
      "twitter",
      data.itemtype
    );
  });
  $("a.social-link.vk").on("click", function (e) {
    var data = $(this).data();
    incrementShare(
      data.articleid,
      getCookieValue("cartId"),
      "vk",
      data.itemtype
    );
  });

  function shareOverrideOGMeta(
    overrideLink,
    overrideTitle,
    overrideDescription,
    overrideImage,
    articleId,
    shareType,
    itemType
  ) {
    FB.ui(
      {
        method: "share_open_graph",
        action_type: "og.likes",
        action_properties: JSON.stringify({
          object: {
            "og:url": overrideLink,
            "og:title": overrideTitle,
            "og:description": overrideDescription,
            "og:image": overrideImage
          }
        })
      },
      function (response) {
        incrementShare(
          articleId,
          getCookieValue("cartId"),
          shareType,
          itemType
        );
      }
    );
  }

  function incrementShare(id, userId, type, itemType) {
    var call = makeAjaxCall(
      contentServiceUrl,
      "POST",
      {
        id: id,
        type: type,
        action: "addShare",
        user: userId,
        itemType: itemType
      },
      false
    );
  }

  if ($(window).width() < 768) {
    $(".mobile_menu").on("click", function () {
      $(this).toggleClass("open");
      $(".header").toggleClass("open");
    });
  }

  if ($("form[name=payment]").length > 0) {
    $("form[name=payment]").submit();
  }
  if ($(".js_payment-success").length > 0) {
    deleteCookie("cartId");
  }
  $(
    ".similar_posts, .blog-list, .article-body, .blog-sidebar, .js_homepage_slider"
  ).on("click", ".js_bookmarks", function (e) {
    if (checkUserLoggedIn()) {
      addBookmark($(this));
    } else {
      showLogin(e);
    }
  });

  if ($(".blog-list").length > 0) {
    $(".js_blog-load_more").on("click", function () {
      if (!$(".blog-list").data("noMoreArticles")) {
        loadMoreArticles();
      }
    });
  }

  $(document).on("scroll", function () {
    if ($(document).scrollTop() > 1200) {
      $(".js_back_to_top").removeClass("hide");
    } else {
      $(".js_back_to_top").addClass("hide");
    }
    var load =
      $(document).height() -
        ($(document).scrollTop() +
          $(window).height() +
          $("footer.footer").height() +
          300) <
        0 && window.innerWidth >= 768;
    if (load) {
      loadMoreArticles();
    }
  });
  $(".js_back_to_top").on("click", function () {
    $("html,body").animate({ scrollTop: 0 }, "slow");
    $(".js_back_to_top").addClass("hide");
    return false;
  });

  $(".js_autoresizable-textarea").on(
    "change keyup keydown paste cut",
    function () {
      $(this)
        .height(0)
        .height(this.scrollHeight - 42);
    }
  );
  $(".js_icon-delete").on("click", function (e) {
    e.preventDefault();
    showLoader();
    var id = $(this).data().id;
    $.ajax({
      type: "POST",
      url: "/article/delete",
      data: { id: id },
      success: function (data) {
        hideLoader();
        if (data.success) {
          $("div[data-articleid=" + id + "]").remove();
          showSnackBar("Статья удалена.", "success");
        } else {
          showSnackBar("Поизошла ошибка.", "success");
        }
      },
      error: function (data) {
        hideLoader();
        showSnackBar("Поизошла ошибка.", "success");
      }
    });
  });
}

function addBookmark(btn) {
  var call = makeAjaxCall(
    "/_/service/com.myurchenko.kostirpg/user",
    "POST",
    {
      id: btn.data().contentid,
      action: "addBookmark"
    },
    false
  );
  call.done(function (data) {
    if (data === true) {
      btn.addClass("active");
      if (!isEmpty(btn)) {
        btn.text("В ЗАКЛАДКАХ");
      }
      showSnackBar("Добавлено в закладки.", "info");
    } else {
      btn.removeClass("active");
      if (!isEmpty(btn)) {
        btn.text("В ЗАКЛАДКИ");
      }
      showSnackBar("Удалено из закладок.", "info");
    }
  });
}

$(".js_feed-button").on("click", function (e) {
  e.preventDefault();
  var wrapper = $(".blog-list");
  var date = new Date();
  wrapper.data("page", 0);
  wrapper.data("feedtype", $(this).data().type);
  wrapper.data("date", date.toISOString());
  wrapper.data("start", 0);
  wrapper.data("query", "");
  wrapper.data("nomorearticles", false);
  $(".js_blog-list-empty").addClass("hidden");
  $(".js_feed-button.active").removeClass("active");
  $(this).addClass("active");
  wrapper.html("");
  loadMoreArticles();
});

function loadMoreArticles() {
  var wrapper = $(".blog-list");
  if (wrapper.length !== 1) {
    return false;
  }
  var page = wrapper.data().page;
  var feedType = wrapper.data().feedtype;
  var date = wrapper.data().date;
  var query = wrapper.data().query;

  if (
    (loadMoreRequest && loadMoreRequest.state() !== "resolved") ||
    wrapper.data().nomorearticles === true
  ) {
    return false;
  }

  $(".js_blog-list-lazyload-icon").removeClass("hidden");
  $(".js_blog-load_more").addClass("hidden");
  if (!page) {
    page = 0;
  }
  loadMoreRequest = makeAjaxCall(
    contentServiceUrl,
    "GET",
    {
      feedType: feedType
        ? feedType
        : $(".js_blog-navigation .active").data("type"),
      page: page,
      date: date ? date : null,
      query: query ? query : null,
      start: wrapper.data("start"),
      userId: $(".js_user-page-id").data("userid")
    },
    false
  );
  loadMoreRequest.done(function (data) {
    data = JSON.parse(data);
    if (data && data.articles && data.articles.trim() !== "") {
      wrapper.append(data.articles);
    }
    if (data.hideButton) {
      $(".js_blog-list-empty").removeClass("hidden");
      wrapper.data("nomorearticles", true);
    }
    if (data.nextStart === null || data.nextStart === undefined) {
      wrapper.data("start", 0);
    } else {
      wrapper.data("start", data.nextStart);
    }
    wrapper.data("date", data.date);
    if (data.newPage) {
      wrapper.data("page", 0);
    } else {
      wrapper.data("page", page + 1);
    }
    $(".js_blog-list-lazyload-icon").addClass("hidden");
  });
}

function initCartFunctions() {
  $(".js_cart-remove_btn").on("click", function () {
    var data = {
      itemId: $(this).data().id,
      size: $(this).data().size,
      amount: 0,
      cartId: $("#ordersAdminCartID").length
        ? $("#ordersAdminCartID").val()
        : getCookieValue("cartId"),
      action: "modify",
      force: true
    };
    var data = addToCart(data);
    removeItemFromDOM(this);
    function removeItemFromDOM(el) {
      $(el).closest(".cart-item").remove();
    }
  });
}

var snackBar = $(".js_snackbar");
var snackBarText = $(".js_snackbar .snackbar-text");
var snackBarClose = $(".js_snackbar .snackbar-close");
function resetSnackBar() {
  snackBar.removeClass("show");
  setTimeout(function () {
    snackBar.removeClass("warning");
    snackBar.removeClass("error");
    snackBar.removeClass("notification");
    snackBar.removeClass("message");
    snackBar.removeClass("info");
    snackBar.removeClass("success");
    snackBarText.text("");
  }, 300);
}

function showSnackBar(message, type) {
  snackBar.addClass(type);
  snackBarText.text(message);
  snackBar.addClass("show");
  setTimeout(function () {
    resetSnackBar();
  }, 3000);
}

function scrollToHash() {
  if (window.location.hash) {
    $("html, body").animate(
      {
        scrollTop: $(window.location.hash).offset().top - 85
      },
      "slow"
    );
  }
}

function scrollToItem(item) {
  $("html, body").animate(
    {
      scrollTop: item.offset().top - 85
    },
    "slow"
  );
}

$(document).ready(function () {
  initSharedEvents();
  initLoginRegisterForm();
  initCheckoutEvents();
  initCartFunctions();
  initHeaderFunctions();
  initPDPFunctions();
  if (
    $("body.article-page").length > 0 &&
    $("body.article-page-create_article").length === 0
  ) {
    addArticleViews();
  }
});
$(window).load(function () {
  scrollToHash();
});
function copyStringToClipboard(str) {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style = { position: "absolute", left: "-9999px" };
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}
