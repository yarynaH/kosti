function initPDPFunctions() {
  $(".qty-decrement").on("click", function() {
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
  $(".qty-input").on("change", function() {
    var input = $(this);
    if (isNaN(parseInt(input.val())) || parseInt(input.val()) < 1) {
      input.val("1");
    }
    input.val(Math.max(parseInt(input.val()), 1));
    if ($(".cart-list").length > 0) {
      addToCartOnclick(input);
    }
  });
  $(".qty-increment").on("click", function() {
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
  $(".add_to_cart-btn").on("click", function(e) {
    e.preventDefault();
    if ($("#pdp-size-select").length && !$("#pdp-size-select").val()) {
      $("#pdp-size-select").addClass("is-invalid");
    } else {
      $("#pdp-size-select").removeClass("is-invalid");
      addToCart();
    }
  });
  $("#pdp-size-select").on("change", function() {
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
  $("#phone-checkout-input").on("change paste keyup", function() {
    $("#phone-checkout-input").val(
      $("#phone-checkout-input")
        .val()
        .replace(/\D+/g, "")
    );
  });
}

function initSharedEvents() {
  $("body").on("click", ".js_login-required", function(e) {
    if (!checkUserLoggedIn()) {
      e.preventDefault();
      showLogin(e);
    }
  });
  snackBarClose.on("click", function() {
    resetSnackBar();
  });
  setCookie(cartId);
  $(
    ".similar_posts, .blog-list, .article-body, .blog-sidebar, .js_homepage_slider"
  ).on("click", ".js_like-article", function(e) {
    e.preventDefault();
    if (checkUserLoggedIn()) {
      doUpvote(this);
    } else {
      showLogin(e);
    }
  });
  $(".js_copy_url").on("click", function(e) {
    e.preventDefault();
    var data = $(this).data();
    copyStringToClipboard(data.url);
    showSnackBar("Ссылка скопирована.", "success");
  });

  $("a.social-link.facebook").on("click", function(e) {
    var data = $(this).data();
    shareOverrideOGMeta(
      data.url,
      data.title,
      data.description.replace(/(&nbsp;|(<([^>]+)>))/gi, ""),
      data.image,
      data.articleid,
      "facebook"
    );
  });
  $("a.social-link.twitter").on("click", function(e) {
    var data = $(this).data();
    incrementShare(data.articleid, getCookieValue("cartId"), "twitter");
  });
  $("a.social-link.vk").on("click", function(e) {
    var data = $(this).data();
    incrementShare(data.articleid, getCookieValue("cartId"), "vk");
  });

  function shareOverrideOGMeta(
    overrideLink,
    overrideTitle,
    overrideDescription,
    overrideImage,
    articleId,
    shareType
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
      function(response) {
        incrementShare(articleId, getCookieValue("cartId"), shareType);
      }
    );
  }

  function incrementShare(id, userId, type) {
    var call = makeAjaxCall(
      contentServiceUrl,
      "POST",
      { id: id, type: type, action: "addShare", user: userId },
      false
    );
  }

  if ($(window).width() < 768) {
    $(".mobile_menu").on("click", function() {
      $(this).toggleClass("open");
      $(".header").toggleClass("open");
    });
  }

  if ($("form[name=payment]").length > 0) {
    $("form[name=payment]").submit();
  }
  if ($("#payment-success").length > 0) {
    deleteCookie("cartId");
  }
  $(
    ".similar_posts, .blog-list, .article-body, .blog-sidebar, .js_homepage_slider"
  ).on("click", ".js_bookmarks", function(e) {
    if (checkUserLoggedIn()) {
      addBookmark($(this));
    } else {
      showLogin(e);
    }
  });

  if ($(".blog-list").length > 0) {
    $(".js_blog-load_more").on("click", function() {
      if (!$(".blog-list").data("noMoreArticles")) {
        loadMoreArticles();
      }
    });
  }

  $(document).on("scroll", function() {
    if ($(document).scrollTop() > 1200) {
      $(".js_back_to_top").removeClass("hidden");
    } else {
      $(".js_back_to_top").addClass("hidden");
    }
  });
  $(".js_back_to_top").on("click", function() {
    $("html,body").animate({ scrollTop: 0 }, "slow");
    $(".js_back_to_top").addClass("hidden");
    return false;
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
  call.done(function(data) {
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

function loadMoreArticles() {
  $(".js_lazyload-icon").removeClass("hidden");
  $(".js_blog-load_more").addClass("hidden");
  var wrapper = $(".blog-list");
  var page = wrapper.data("page");
  if (!page) {
    page = 0;
  }
  var feedType = wrapper.data("feedtype");
  var date = wrapper.data("date");
  var query = wrapper.data("query");
  var call = makeAjaxCall(
    contentServiceUrl,
    "GET",
    {
      feedType: feedType
        ? feedType
        : $(".js_blog-navigation .active").data("type"),
      page: page,
      date: date ? date : null,
      query: query ? query : null,
      userId: $(".js_user-page-id").data("userid")
    },
    false
  );
  call.done(function(data) {
    data = JSON.parse(data);
    if (data && data.articles && data.articles.trim() !== "") {
      $(".js_blog-load_more").text(data.buttonText);
      $(".js_blog-load_more").prop("title", data.buttonText);
      $(".js_blog-load_more").removeClass("hidden");
      wrapper.append(data.articles);
    }
    if (data.hideButton) {
      $(".js_blog-load_more").addClass("hidden");
      $(".js_blog-list-empty").removeClass("hidden");
      wrapper.attr("data-nomorearticles", true);
    }
    wrapper.attr("data-date", data.date);
    if (data.newPage) {
      wrapper.attr("data-page", 0);
    } else {
      wrapper.attr("data-page", page + 1);
    }
    $(".js_lazyload-icon").addClass("hidden");
  });
}

function initCartFunctions() {
  $(".js_cart-remove_btn").on("click", function() {
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
      $(el)
        .closest(".cart-item")
        .remove();
    }
  });
}

var snackBar = $(".js_snackbar");
var snackBarText = $(".js_snackbar .snackbar-text");
var snackBarClose = $(".js_snackbar .snackbar-close");
function resetSnackBar() {
  snackBar.removeClass("show");
  setTimeout(function() {
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
  setTimeout(function() {
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

$(document).ready(function() {
  initSharedEvents();
  initLoginRegisterForm();
  initCheckoutEvents();
  initCartFunctions();
  initHeaderFunctions();
  initPDPFunctions();
  if ($("body.article-page").length > 0) {
    addArticleViews();
  }
});
$(window).load(function() {
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
