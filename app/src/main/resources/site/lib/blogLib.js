var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var kostiUtils = require('kostiUtils');
var votesLib = require('votesLib');

function beautifyArticleArray( articles ){
	articles = norseUtils.forceArray(articles);
	for( var i = 0; i < articles.length; i++ ){
		articles[i] = beautifyArticle(articles[i]);
	}
	return articles;
}

function beautifyArticle( article ){
    article.image = norseUtils.getImage( article.data.image, 'block(1920, 1080)' );
    article.author = contentLib.get({ key: article.data.author });
    article.url = portal.pageUrl({ id: article._id });
    article.author.image = norseUtils.getImage( article.author.data.userImage, 'block(60, 60)' );
    article.author.url = portal.pageUrl({ id: article.author._id });
    article.date = kostiUtils.getTimePassedSincePostCreation(article.publish.from.replace('Z', ''));
    article.votes = votesLib.countUpvotes(article._id);
    return article;
}

exports.beautifyArticle = beautifyArticle;
exports.beautifyArticleArray = beautifyArticleArray;