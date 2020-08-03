$(document).ready(function () {
  $(".js_checkout-form").validate({
    ignore: "",
    highlight: function (element, errorClass, validClass) {},
    unhighlight: function (element, errorClass, validClass) {}
  });
  $(".js_shipping-form").validate({
    ignore: "",
    highlight: function (element, errorClass, validClass) {},
    unhighlight: function (element, errorClass, validClass) {},
    rules: {
      novaPoshtaСity: {
        required: function (element) {
          return checkNovaPoshtaValidation();
        }
      },
      novaPoshtaWarehouse: {
        required: function (element) {
          return checkNovaPoshtaValidation();
        }
      }
    }
  });
  $(".js_store-slider").slick({
    dots: true,
    arrows: false,
    autoplaySpeed: 3000,
    autoplay: true
  });
  function checkNovaPoshtaValidation() {
    if ($("input[value=novaposhta]").is(":checked")) {
      return true;
    } else {
      return false;
    }
  }
  $("input[name=shipping]").on("click", function () {
    if ($(this).attr("value") === "novaposhta") {
      $(".delivery_details").removeClass("hidden");
    } else {
      $(".delivery_details").addClass("hidden");
    }
  });
});

function addToCart(data) {
  var data = data;
  if (!data) {
    data = {
      action: "modify",
      cartId: getCookieValue("cartId"),
      itemId: $("input[name=productId]").val(),
      amount: $("input[name=quantity]").val(),
      size: $("select[name=itemSize]").val()
    };
  }
  $(".minicart .minicart-qty").removeClass("animate");
  var call = makeAjaxCall(cartServiceUrl, "POST", data, true);
  call.done(function (data) {
    setCookie(data._id);
    $(".minicart .minicart-total").html("UAH " + data.price.items);
    $(".minicart .minicart-qty").text(
      parseInt(data.itemsNum) > 99 ? "9+" : data.itemsNum
    );
    $(".cart-total .value .cart-items-price").text(data.price.items);
    $(".minicart .minicart-qty").addClass("animate");
    if (data.stock) {
      $(".checkout-action .checkout-continue").removeClass("not-active");
    } else {
      $(".checkout-action .checkout-continue").addClass("not-active");
    }
    if (
      data.items &&
      data.items.length < 1 &&
      $(".checkout-action .checkout-continue").length > 0
    ) {
      $(".checkout-action .checkout-continue").addClass("not-active");
    }
    for (var i = 0; i < data.items.length; i++) {
      var selector =
        ".cart-product_price-wrap[data-id=" + data.items[i]._id + "]";
      data.items[i].itemSize
        ? (selector += "[data-size=" + data.items[i].itemSize + "]")
        : false;
      if (data.items[i].stock && data.items[i].itemSizeStock) {
        $(selector).find(".productPrice").removeClass("hidden");
        $(selector).find(".productOutOfStock").addClass("hidden");
      } else {
        $(selector).find(".productPrice").addClass("hidden");
        $(selector).find(".productOutOfStock").removeClass("hidden");
      }
    }
    showSnackBar("Добавлено в корзину.", "success");
  });
}

$(".pdp-image-item img").on("click", function (e) {
  e.preventDefault();
  var prevImg = $(".pdp-main_image").find("img").attr("src");
  $(".pdp-main_image").find("img").attr("src", $(this).attr("src"));
  if (window.outerWidth >= 768) {
    $(".pdp-main_image").zoom({ url: $(this).attr("src") });
  }
  //$(this).attr("src", prevImg);
});

function addToCartOnclick(input) {
  var data = {
    itemId: input.data().id,
    size: input.data().size,
    amount: input.val(),
    cartId: getCookieValue("cartId"),
    action: "modify",
    force: true
  };
  addToCart(data);
}

function filterProducts() {
  var search = location.search.substring(1);
  if (!(search == "")) {
    var filterList = JSON.parse(
      '{"' +
        decodeURI(search)
          .replace(/"/g, '\\"')
          .replace(/&/g, '","')
          .replace(/=/g, '":"') +
        '"}'
    );

    for (var key in filterList) {
      filterList[key] = filterList[key].split(",");

      for (var i = 0; i < filterList[key].length; i++) {
        $(".js-filter-btn[data-value='" + filterList[key][i] + "']").addClass(
          "active"
        );
      }
    }
    filterList.sort = filterList.sort.join(",");
    $(".js_store-sorting").val(filterList.sort);
  } else {
    var filterList = {};
  }

  $(".js-filter-clear_all").on("click", function () {
    showLoader();
    filterList = {};
    refreshProducts();
    $(".js-filter-btn").each(function () {
      $(this).removeClass("active");
    });
    $(".js_store-sorting").val("");
  });

  $(".js-filter-btn").on("click", function (e) {
    e.preventDefault();
    showLoader();
    $(this).toggleClass("active");
    var type = $(this).data("type");
    if (!filterList.hasOwnProperty(type)) {
      filterList[type] = [];
    }
    var valueIndex = filterList[type].indexOf($(this).data("value"));
    if (valueIndex === -1) {
      filterList[type].push($(this).data("value"));
    } else {
      filterList[type].splice(valueIndex, 1);
      if (filterList[type].length == 0) {
        delete filterList[type];
      }
    }

    refreshProducts();
  });

  $(".js_store-sorting").on("change", function () {
    showLoader();
    filterList.sort = $(this).val();
    refreshProducts();
  });

  function refreshProducts() {
    var urlParameters = Object.entries(filterList)
      .map(function (e) {
        return e.join("=");
      })
      .join("&");

    if (history.pushState) {
      var newurl =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        urlParameters;
      window.history.pushState({ path: newurl }, "", newurl);
    }

    var call = makeAjaxCall("/api/store/product" + "?" + urlParameters, "GET");
    call.done(function (data) {
      $(".js_plp-list").html(data.html);

      hideLoader();
    });
  }
}

$(".js-filter-show").on("click", function () {
  $(".js-filter-block").slideToggle("slow");
});

$(document).ready(function () {
  filterProducts();
});

$(".js_store-size_chart-link").on("click", function () {
  $(".js_store-size_chart-content").slideToggle("slow");
});
