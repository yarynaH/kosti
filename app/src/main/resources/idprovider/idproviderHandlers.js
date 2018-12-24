var authLib = require('/lib/xp/auth');
var portalLib = require('/lib/xp/portal');
var httpClientLib = require('/lib/xp/http-client');
var tokenLib = require('/lib/token');
var contextLib = require('/lib/context');
var mailLib = require('/lib/mail');
var userLib = require('/lib/user');
var renderLib = require('/lib/render/render');
var norseUtils = require('norseUtils');
var ioLib = require('/lib/xp/io');
var valueLib = require('/lib/xp/value');
var nodeLib = require('/lib/xp/node');
var contentLib = require('/lib/xp/content');

exports.handleLogin = function(req, user, password) {
    var sessionTimeout = authLib.getIdProviderConfig().sessionTimeout;
    var loginResult = authLib.login({
        user: user,
        password: password,
        userStore: portalLib.getUserStoreKey(),
        sessionTimeout: sessionTimeout == null ? null : sessionTimeout
    });
    norseUtils.log(loginResult);
    return {
        body: loginResult,
        contentType: 'application/json'
    };
}

exports.handleForgotPassword = function(req, params) {

    var reCaptcha = authLib.getIdProviderConfig().forgotPassword && authLib.getIdProviderConfig().forgotPassword.reCaptcha;
    if (reCaptcha) {
        var reCaptchaVerificationResponse = httpClientLib.request({
            url: 'https://www.google.com/recaptcha/api/siteverify',
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            multipart: [
                {
                    name: 'secret',
                    value: reCaptcha.secretKey
                },
                {
                    name: 'response',
                    value: params.reCaptcha
                }
            ]
        });

        var reCaptchaVerification = JSON.parse(reCaptchaVerificationResponse.body);
        if (!reCaptchaVerification || !reCaptchaVerification.success) {
            return {
                status: 400,
                contentType: 'application/json'
            }
        }
    }

    var user = userLib.findUserByEmail(params.email);

    //If a user has the email provided
    if (user) {
        //Generates a token
        var token = tokenLib.generateToken(user.key);

        mailLib.sendResetMail(req, params.email, token)

    } else {
        mailLib.sendIncorrectResetMail(req, params.email)
    }


    return {
        body: {},
        contentType: 'application/json'
    };
}

exports.handleModify = function( req ){
    function userEditor(user){
        user.email = req.params.email;
        user.image = image._id;
        return user;
    }
    var stream = portalLib.getMultipartStream('image');
    var imageMetadata = portalLib.getMultipartItem('image');
    var result = null;
    var site = portalLib.getSiteConfig();
    var usersRepo = nodeLib.connect({
        repoId: 'users',
        branch: 'master',
        principals: ["role:system.admin"]
    });
    var user = usersRepo.query({
        start: 0,
        count: 1,
        query: "email = '" + req.params.email + "'",
    }).hits[0].id;
    user = usersRepo.get(user);
    var image = contentLib.createMedia({
        name: imageMetadata.fileName,
        parentPath: contentLib.get({key: site.userImages})._path,
        mimeType: imageMetadata.contentType,
        branch: 'draft',
        data: stream
    });
    var publishResult = contentLib.publish({
        keys: [image._id],
        sourceBranch: 'draft',
        targetBranch: 'master'
    });
    user = usersRepo.modify({
        key: user._id,
        editor: userEditor
    });

    return {
        body: image,
        contentType: "image/jpeg"
    }
}

exports.handleUpdatePwd = function(req, token, password) {
    if (tokenLib.isTokenValid(token)) {
        contextLib.runAsAdmin(function () {
            var user = tokenLib.findUserByToken(token);

            authLib.changePassword({
                userKey: user.key,
                password: password
            });

            authLib.login({
                user: user.login,
                password: password,
                userStore: portalLib.getUserStoreKey()
            });

            mailLib.sendUpdatedPasswordMail(req, user.email);

            tokenLib.removeToken(user.key);
        });

        return {
            body: {updated: true},
            contentType: 'application/json'
        };
    }

    return {
        body: {updated: false},
        contentType: 'application/json'
    };
}

exports.handleRegister = function(req, email, password, user){
    var registerResult = false;
    contextLib.runAsAdmin(function () {
        registerResult = authLib.createUser({
            userStore: 'users',
            name: user,
            displayName: user,
            email: email
        });
        authLib.changePassword({
            userKey: registerResult.key,
            password: password
        });
        registerResult = handleLogin(req, user, password);
    });
    if (registerResult){
        return {
            body: { created: true },
            contentType: 'application/json'
        }
    }
}