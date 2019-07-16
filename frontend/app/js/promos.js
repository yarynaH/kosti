function initPromos() {
  $(".js_promo_code-title").on("click", function() {
    $(this)
      .parent()
      .toggleClass("show");
  });
  $(".js_promo-form").on("click", ".js_promo-remove", function(e) {
    e.preventDefault();
    var code = $(this).data("code");
    var call = makeAjaxCall(
      "/promos",
      "POST",
      {
        action: "removePromo",
        cartId: getCookieValue("cartId"),
        code: code
      },
      true
    );
    call.done(function(data) {
      $(".js_promo_code-used_list").html(data.promos);
      $(".js_summary-discount .value span").text(
        data.cart.price.discount.discount
      );
      $(".js_summary-total .value span").text(data.cart.price.totalDiscount);
    });
  });
  $(".js_promo-form").on("submit", function(e) {
    e.preventDefault();
    var formData = getFormData(this);
    formData.cartId = getCookieValue("cartId");
    var call = makeAjaxCall("/promos", "POST", formData, true);
    call.done(function(data) {
      $(".js_promo_code-used_list").html(data.promos);
      $(".js_summary-discount .value span").text(
        data.cart.price.discount.discount
      );
      $(".js_summary-total .value span").text(data.cart.price.totalDiscount);
    });
  });
}

$(document).ready(function() {
  initPromos();
});
