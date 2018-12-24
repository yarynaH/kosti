var authLib = require('/lib/xp/auth');
var portalLib = require('/lib/xp/portal');
var mustacheLib = require('/lib/xp/mustache');
var displayLib = require('/lib/display');
var gravatarLib = require('/lib/gravatar');
var thymeleaf = require('/lib/xp/thymeleaf');
var helpers = require('helpers');
var norseUtils = require('norseUtils');
var nodeLib = require('/lib/xp/node');


exports.generateLoginPage = function (redirectUrl, info) {
    var view = resolve('login.html');
    var scriptUrl = portalLib.assetUrl({path: "js/login.js"});
    var site = portalLib.getSiteConfig();
    return thymeleaf.render(view, {
        social: site.social,
        pageComponents: helpers.getPageComponents()
    });

    var userStoreKey = portalLib.getUserStoreKey();
    var loginServiceUrl = portalLib.idProviderUrl();
    var forgotPasswordUrl = authLib.getIdProviderConfig().forgotPassword ? portalLib.idProviderUrl({
        params: {
            action: 'forgot'
        }
    }) : undefined;

    var loginConfigView = resolve('login-config.txt');
    var config = mustacheLib.render(loginConfigView, {
        redirectUrl: redirectUrl,
        userStoreKey: userStoreKey,
        loginServiceUrl: loginServiceUrl
    });

    return generatePage({
        scriptUrl: scriptUrl,
        config: config,
        info: info,
        body: {
            username: "Username or email",
            password: "Password",
            forgotPasswordUrl: forgotPasswordUrl
        }
    });
};

exports.generateRegisterPage = function(){
    var view = resolve('register.html');
    var site = portalLib.getSiteConfig();
    return thymeleaf.render(view, {
        social: site.social,
        pageComponents: helpers.getPageComponents()
    });
}

exports.generateUserPage = function(user){
    var view = resolve('user.html');
    var site = portalLib.getSiteConfig();
    var repoUser = getUserFromRepo( user.email );
    var image = portalLib.imageUrl({
        id: repoUser.image,
        scale: 'block(120,120)'
    });
    return thymeleaf.render(view, {
        social: site.social,
        user: user,
        image: image,
        pageComponents: helpers.getPageComponents()
    });
}

exports.generateLogoutPage = function (user) {
    var scriptUrl = portalLib.assetUrl({path: "js/redirect.js"});

    var redirectUrl = portalLib.logoutUrl();
    var logoutConfigView = resolve('redirect-config.txt');
    var config = mustacheLib.render(logoutConfigView, {
        redirectUrl: redirectUrl
    });

    var profileUrl;
    if (user.email && authLib.getIdProviderConfig().gravatar) {
        var gravatarHash = gravatarLib.hash(user.email);
        profileUrl = "https://www.gravatar.com/avatar/" + gravatarHash + "?d=blank";
    }

    return generatePage({
        scriptUrl: scriptUrl,
        config: config,
        title: user.displayName,
        profileUrl: profileUrl,
        submit: "LOG OUT"
    });
};

exports.generateForgotPasswordPage = function (expired) {
    var scriptUrl = portalLib.assetUrl({path: "js/forgot-pwd.js"});

    var redirectUrl = portalLib.idProviderUrl({params: {action: 'sent'}});
    var sendTokenUrl = portalLib.idProviderUrl();
    var logoutConfigView = resolve('forgot-pwd-config.txt');
    var config = mustacheLib.render(logoutConfigView, {
        redirectUrl: redirectUrl,
        sendTokenUrl: sendTokenUrl
    });

    var reCaptcha = authLib.getIdProviderConfig().forgotPassword && authLib.getIdProviderConfig().forgotPassword.reCaptcha;

    return generatePage({
        scriptUrl: scriptUrl,
        config: config,
        title: "Password reset",
        error: expired ? "Sorry, but this link has expired. You can request another one below." : undefined,
        body: {
            username: "Email",
            reCaptcha: reCaptcha && reCaptcha.siteKey
        },
        submit: "RESET"
    });
};

exports.generateUpdatePasswordPage = function (token) {
    var scriptUrl = portalLib.assetUrl({path: "js/update-pwd.js"});

    var idProviderUrl = portalLib.idProviderUrl();

    var configView = resolve('update-pwd-config.txt');
    var config = mustacheLib.render(configView, {
        idProviderUrl: idProviderUrl,
        token: token
    });

    return generatePage({
        scriptUrl: scriptUrl,
        config: config,
        title: "Update password",
        body: {
            password: "New Password",
            confirmation: "Confirm new password"
        },
        submit: "UPDATE"
    });
};

function generatePage(params) {
    var idProviderConfig = authLib.getIdProviderConfig();
    params.title = params.title || idProviderConfig.title || "User Login";
    params.theme = idProviderConfig.theme || "light-blue";
    return displayLib.render(params);
}

function generateBackgroundStyleUrl(theme) {
    var stylePath = "themes/" + theme.split('-', 1)[0] + "-theme.css";
    return portalLib.assetUrl({path: stylePath});
}

function generateColorStyleUrl(theme) {
    var stylePath = "themes/" + theme.split('-', 2)[1] + "-theme.css";
    return portalLib.assetUrl({path: stylePath});
}

function getUserFromRepo( email ){
    var usersRepo = nodeLib.connect({
        repoId: 'users',
        branch: 'master',
        principals: ["role:system.admin"]
    });
    var user = usersRepo.query({
        start: 0,
        count: 1,
        filters: {
            boolean: {
                must: {
                    hasValue: {
                        field: "email",
                        values: [email]
                    }
                }
            }
        }
    });
    if( user.total <= 0 ){
        var result = usersRepo.create({
            email: email
        });
    } else {
        var result = usersRepo.get(user.hits[0].id);
    }
    return result;
}