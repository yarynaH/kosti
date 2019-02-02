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
    var params = JSON.parse(req.body);
    if( params.action == 'register' ){
	    contextLib.runAsAdmin(function () {
		    result = userLib.register( params.name, params.email, params.pass );
	    });
    } else if( params.action == 'login' ){
	    result = userLib.login( params.name, params.pass );
	}
    return {
        body: result,
        contentType: 'application/json'
    }
};