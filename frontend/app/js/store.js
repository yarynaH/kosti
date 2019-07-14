$(document).ready(function() {
  $(".js_checkout-form").validate();
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
  });
}

//! currenly is a backup and not working
//TODO: remove at all
function validateCheckout(e) {
  return null;
  $("form.checkout-form input, form.checkout-form select").each(function() {
    if ($(this).val() == null || $(this).val() == "") {
      e.preventDefault();
      $(this)
        .parent()
        .addClass("is-invalid");
    }
  });
  var tel = $("#phone-checkout-input").val();
  if (tel && !validatePhone(tel)) {
    e.preventDefault();
    $("#phone-checkout-input")
      .parent()
      .addClass("is-invalid");
  }
  var email = $("#email-checkout-input").val();
  if (email && !validateEmail(email)) {
    e.preventDefault();
    $("#email-checkout-input")
      .parent()
      .addClass("is-invalid");
  }
  if ($("#agreement").length && !$("#agreement").is(":checked")) {
    e.preventDefault();
    $("#agreement")
      .parent()
      .addClass("is-invalid");
  }
  if (
    $("#delivery_np-warehouses").length &&
    (!$("#delivery_np-warehouses").val() ||
      $("#delivery_np-warehouses").val() == "")
  ) {
    e.preventDefault();
    $("#delivery_np-warehouses").addClass("is-invalid");
  }
  if (
    $("#delivery_np-input-city").length &&
    (!$("#delivery_np-input-city").val() ||
      $("#delivery_np-input-city").val() == "")
  ) {
    e.preventDefault();
    $("#delivery_np-input-city")
      .parent()
      .addClass("is-invalid");
  }
}
