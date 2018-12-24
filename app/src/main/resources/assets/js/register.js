function handleAuthenticateResponse(loginResult) {
    if (loginResult.authenticated) {
        location.reload();
    } else {
        $("#formMessage").removeClass("hidden form-message-info");
        $("#formMessage").addClass("form-message-error");
        $("#message").text("Login Failed!");
        $("#inputPassword").focus();
    }
}

function formSubmitted() {
    enableFormSubmit(false);
    var data = {
        action: 'register',
        email: $("#inputEmail").val(),
        nickname: $("#nickname").val(),
        password: $("#inputPassword").val()
    };
    $.ajax({
        url: "/_/idprovider/users",
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        success: handleAuthenticateResponse,
        data: JSON.stringify(data)
    }).always(function () {
        enableFormSubmit(true);
    });
}

$("#inputUsername, #inputPassword").keyup(function (event) {
    if (event.which !== 13) {
        $("#formMessage").removeClass("form-message-info form-message-error");
        $("#formMessage").addClass("hidden");
    }
});