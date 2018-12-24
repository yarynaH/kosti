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
var userHandlers = require('idproviderHandlers.js');

exports.handle401 = function (req) {
    var body = renderLib.generateLoginPage();

    return {
        status: 401,
        contentType: 'text/html',
        body: body
    };
};

exports.login = function (req) {
    var redirectUrl = req.validTicket ? req.params.redirect : generateRedirectUrl();
    var body = renderLib.generateLoginPage(redirectUrl);
    return {
        contentType: 'text/html',
        body: body
    };
};

exports.register = function(req) {
    var body = renderLib.generateRegisterPage();
    return {
        contentType: 'text/html',
        body: body
    };
}

exports.logout = function (req) {
    authLib.logout();

    if (req.validTicket && req.params.redirect) {
        return {
            redirect: req.params.redirect
        };
    }

    var body = renderLib.generateLoginPage(generateRedirectUrl(), "Successfully logged out");
    return {
        contentType: 'text/html',
        body: body
    };
};

exports.get = function (req) {
    var body;

    var action = req.params.action;
    if (action == 'forgot') {
        body = renderLib.generateForgotPasswordPage();
    }else if (action == 'sent') {
        body = renderLib.generateLoginPage(generateRedirectUrl(), "We have sent an email with instructions on how to reset your password");
    } else if (action == 'reset' && req.params.token) {
        if (tokenLib.isTokenValid(req.params.token)) {
            body = renderLib.generateUpdatePasswordPage(req.params.token);
        } else {
            body = renderLib.generateForgotPasswordPage(true);
        }
    } else {
        var user = authLib.getUser();
        if (user) {
            body = renderLib.generateUserPage(user);
        } else if( action == 'register' ){
            body = renderLib.generateRegisterPage();
        } else {
            body = renderLib.generateLoginPage(generateRedirectUrl());
        }
    }

    return {
        contentType: 'text/html',
        body: body
    };
};

exports.post = function (req) {
    if( req.body ){
        var body = JSON.parse(req.body);
    } else {
        var body = req.params;
    }

    var action = body.action;
    if (action == 'login' && body.user && body.password) {
        return userHandlers.handleLogin(req, body.user, body.password);
    } else if (action == 'send' && body.email) {
        return userHandlers.handleForgotPassword(req, body);
    } else if (action == 'update' && body.token && body.password) {
        return userHandlers.handleUpdatePwd(req, body.token, body.password);
    } else if (action == 'register' && body.email && body.password && body.nickname ){
        return userHandlers.handleRegister(req, body.email, body.password, body.nickname);
    } else if (action == 'modify'){
        return userHandlers.handleModify(req);
    }

    return {
        status: 400,
        contentType: 'application/json'
    };
};

function generateRedirectUrl() {
    var site = contextLib.runAsAdmin(function () {
        return portalLib.getSite();
    });
    if (site) {
        return portalLib.pageUrl({id: site._id});
    }
    return '/';
}
