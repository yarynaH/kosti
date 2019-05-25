var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var votesLib = require('votesLib');
var contextLib = require('/lib/contextLib');
var blogLib = require('blogLib');
var userLib = require('userLib');

exports.post = function(req){
    var params = req.params;
    var result = {};
    contextLib.runAsAdmin(function () {
        result = votesLib.vote( params.user, params.content );
    });
    return {
	    body: result,
	    contentType: 'application/json'
    }
}

exports.get = function(req){
	var params = req.params;
	if( params.page ){
		var page = parseInt(params.page);
	} else {
		var page = 0;
	}
	switch(params.feedType){
		case 'new':
            var articles = blogLib.getNewArticles( page );
			break;
		case 'bookmarks':
			var user = userLib.getCurrentUser();
            var articles = blogLib.getArticlesByIds( user.data.bookmarks, page );
			break;
		default:
            var articles = blogLib.getHotArticles( page );
			break;
	}
    return {
        body: blogLib.getArticlesView(articles),
        contentType: 'text/html'
    }
}