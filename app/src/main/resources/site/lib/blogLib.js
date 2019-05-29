var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var kostiUtils = require('kostiUtils');
var votesLib = require('votesLib');
var thymeleaf = require('/lib/thymeleaf');
var userLib = require('userLib');

exports.beautifyArticle = beautifyArticle;
exports.beautifyArticleArray = beautifyArticleArray;
exports.getArticlesView = getArticlesView;

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
    article.voted = false;
    article.bookmarked = userLib.checkIfBookmarked(article._id);
    if( parseInt(article.votes) > 0 ){
        article.voted = votesLib.checkIfVoted( article._id );
    }
    return article;
}

function getArticlesView( articles ){
    return thymeleaf.render(resolve('../pages/homePage/articleList.html'), {articles: articles});
}