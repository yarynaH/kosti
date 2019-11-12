$(document).ready(function() {
  $(".js_checkout-form").validate({
    ignore: "",
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {}
  });
  $(".js_shipping-form").validate({
    ignore: "",
    highlight: function(element, errorClass, validClass) {},
    unhighlight: function(element, errorClass, validClass) {},
    rules: {
      novaPoshtaСity: {
        required: function(element) {
          return checkNovaPoshtaValidation();
        }
      },
      novaPoshtaWarehouse: {
        required: function(element) {
          return checkNovaPoshtaValidation();
        }
      }
    }
  });
  function checkNovaPoshtaValidation() {
    if ($("input[value=novaposhta]").is(":checked")) {
      return true;
    } else {
      return false;
    }
  }
  $("input[name=shipping]").on("click", function() {
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
  call.done(function(data) {
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
    for (var i = 0; i < data.items.length; i++) {
      var selector =
        ".cart-product_price-wrap[data-id=" + data.items[i]._id + "]";
      data.items[i].itemSize
        ? (selector += "[data-size=" + data.items[i].itemSize + "]")
        : false;
      if (data.items[i].stock && data.items[i].itemSizeStock) {
        $(selector)
          .find(".productPrice")
          .removeClass("hidden");
        $(selector)
          .find(".productOutOfStock")
          .addClass("hidden");
      } else {
        $(selector)
          .find(".productPrice")
          .addClass("hidden");
        $(selector)
          .find(".productOutOfStock")
          .removeClass("hidden");
      }
    }
    showSnackBar("Добавлено в корзину.", "success");
  });
}

$(".pdp-image-item img").on("click", function(e) {
  console.log("123");
  e.preventDefault();
  var prevImg = $(".pdp-main_image")
    .find("img")
    .attr("src");
  $(".pdp-main_image")
    .find("img")
    .attr("src", $(this).attr("src"));
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
