function initKosticonnetcScripts() {
  $(".js_scroll").on("click", function (e) {
    e.preventDefault();
    scrollToItem($("." + $(this).data().direction), true);
  });
  $(".js_ticket-buy").on("click", function (e) {
    addTocart(e, this);
  });
}

function addTocart(e, element) {
  e.preventDefault();
  let data = {
    action: "modify",
    cartId: getCookieValue("cartId"),
    itemId: $(element).data().itemid,
    amount: 1
  };
  let sizeSelect = $(element).parent().find("select");
  if (sizeSelect.length > 0) {
    data.size = sizeSelect.val();
  }
  let call = makeAjaxCall(cartServiceUrl, "POST", data, true);
  call.done(function () {
    let win = window.open("/cart", "_blank");
    win.focus();
  });
}

$(document).ready(function () {
  initKosticonnetcScripts();
});
