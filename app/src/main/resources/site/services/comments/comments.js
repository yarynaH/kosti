var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/contextLib');
var commentsLib = require('commentsLib');

exports.post = function(req){
    var params = req.params;
    var result = {};
    switch( params.action ){
    	case 'addComment':
		    contextLib.runAsAdmin(function () {
		        result = commentsLib.addComment( params.parent, params.body );
		    });
		    break;
		case 'vote':
		    contextLib.runAsAdmin(function () {
		        result = commentsLib.voteForComment( params.id );
		    });
		    break;
    }
    return {
	    body: result,
	    contentType: 'application/json'
    }
}