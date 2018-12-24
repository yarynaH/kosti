function handleAuthenticateResponse() {
    location.href = CONFIG.idProviderUrl;
}

function formSubmitted() {
    if ($("#inputPassword").val() == $("#inputConfirmation").val()) {
        enableFormSubmit(false);
        var data = {
            action: 'update',
            token: CONFIG.token,
            password: $("#inputPassword").val()
        };
        $.ajax({
            url: CONFIG.idProviderUrl,
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: handleAuthenticateResponse,
            data: JSON.stringify(data)
        }).always(function () {
            enableFormSubmit(true);
        });
    } else {
        $("#formMessage").removeClass("hidden form-message-info");
        $("#formMessage").addClass("form-message-error");
        $("#message").text("Please ensure the password and the confirmation are the same!");
        $("#inputPassword").focus();
    }
}