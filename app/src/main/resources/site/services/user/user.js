var norseUtils = require('norseUtils');
var userLib = require('userLib');
var mailsLib = require('mailsLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');

var templates = {
    forgotPassForm: "forgotPassForm.html",
    resetFailed: "resetFailed.html",
    unsubscribe: "unsubscribe.html",
    userActivation: "userActivation.html"
}

exports.get = function( req ) {
    var params = req.params;
    switch( params.action ){
        case "logout":
            return logout();
            break;
        case "confirmRegister":
            userLib.activateUser( decodeURIComponent(params.mail), params.hash );
            break;
        case "newsletterUnsubscribe":
            mailsLib.unsubscribe( params.hash );
            view = resolve(templates.forgotPassForm);
            break;
        default:
            break;
    }
    return {
        body: "test",
        contentType: 'text/html'
    }
};

exports.post = function( req ) {
	var result = false;
    var params = req.params;
    if( params.action == 'register' ){
	    contextLib.runAsAdmin(function () {
		    result = userLib.register( params.username, params.email, params.password );
	    });
    } else if( params.action == 'login' ){
	    result = userLib.login( params.username, params.password );
	} else if( params.action == 'image' ){
        result = userLib.uploadUserImage();
    }
    return {
        body: result,
        contentType: 'application/json'
    }
};

function logout(){
    userLib.logout();
    var site = portal.getSite();
    return {
        redirect: portal.pageUrl({ path: site._path })
    }
}