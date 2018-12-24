function handleAuthenticateResponse(loginResult) {
    location.href = CONFIG.redirectUrl;
}

function formSubmitted() {
    enableFormSubmit(false);
    var reCaptcha;
    if ($("#g-recaptcha-response").length) {
        reCaptcha = $("#g-recaptcha-response").val();
    }

    var data = {
        action: 'send',
        email: $("#inputUsername").val(),
        reCaptcha: reCaptcha
    };
    $.ajax({
        url: CONFIG.sendTokenUrl,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleAuthenticateResponse,
        data: JSON.stringify(data)
    }).always(function () {
        enableFormSubmit(true);
    });
}