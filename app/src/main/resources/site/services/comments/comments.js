var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var contextLib = require('/lib/contextLib');
var commentsLib = require('commentsLib');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.post = function(req){
    var params = req.params;
    var result = {};
    switch( params.action ){
    	case 'addComment':
		    contextLib.runAsAdmin(function () {
		        result = commentsLib.addComment( params.parent, params.body );
		    });
    		return {
			    body: thymeleaf.render(resolve('../../pages/article/commentItem.html'), {comment: result}),
		    	contentType: 'text/html'
		    }
		    break;
		case 'vote':
		    contextLib.runAsAdmin(function () {
		        result = commentsLib.voteForComment( params.id );
		    });
		    break;
		case 'remove':
		    contextLib.runAsAdmin(function () {
		        result = commentsLib.removeComment( params.id );
		    });
		    break;
    }
    return {
	    body: result,
	    contentType: 'application/json'
    }
}