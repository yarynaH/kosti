var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');

exports.get = function( req ) {
    var result = false;
    return {
        body: result,
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