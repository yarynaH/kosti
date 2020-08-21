function isEmpty(el) {
  return !$.trim(el.html());
}

function validateEmail(email) {
  var re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(String(phone).toLowerCase());
}

function setCookie(cartId) {
  document.cookie =
    "cartId=" +
    cartId +
    "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT; SameSite=None";
}

function deleteCookie(name) {
  document.cookie = name + "=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function showLogin(e) {
  e.stopPropagation();
  hideAllModals();
  removeScroll();
  $(".js_login-form").addClass("show");
}

function getCookieValueOld(a) {
  var b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

function getCookieValue(name) {
  var value = `; ${document.cookie}`;
  var parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function makeAjaxCall(url, method, data, async) {
  return $.ajax({
    url: url,
    type: method,
    async: async,
    data: data
  });
}

function checkUserLoggedIn() {
  if (
    $(".js_header-user").data().userid &&
    $(".js_header-user").data().userid != ""
  ) {
    return true;
  }
  return false;
}

function getFormData(el) {
  var formData = {};
  $.each($(el).serializeArray(), function () {
    if (formData[this.name] === null || formData[this.name] === undefined) {
      formData[this.name] = this.value;
    } else {
      formData[this.name] = forceArray(formData[this.name]);
      formData[this.name].push(this.value);
    }
  });
  return formData;
}

function addArticleViews() {
  var call = makeAjaxCall(
    contentServiceUrl,
    "POST",
    {
      id: getCookieValue("cartId"),
      content: $(".js_article-id").data("articleid"),
      action: "addView"
    },
    true
  );
}

function doUpvote(el) {
  var data = {
    content: $(el).data("contentid"),
    action: "vote"
  };
  var btn = el;
  var call = makeAjaxCall(contentServiceUrl, "POST", data, true);
  call.done(function (data) {
    var result = "0";
    if (data.votes) {
      result = Array.isArray(data.votes) ? data.votes.length : "1";
    }
    if (parseInt($(btn).text().trim()) < result) {
      $(btn).addClass("active");
    } else {
      $(btn).removeClass("active");
    }
    $(btn).html("<span>" + result + "</span>");
  });
}

function forceArray(data) {
  if (!Array.isArray(data)) {
    data = [data];
  }
  return data;
}

function sanitizeString(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
