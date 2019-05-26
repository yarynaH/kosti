var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var kostiUtils = require('kostiUtils');
var votesLib = require('votesLib');
var thymeleaf = require('/lib/xp/thymeleaf');
var userLib = require('userLib');

exports.beautifyArticle = beautifyArticle;
exports.beautifyArticleArray = beautifyArticleArray;
exports.getArticlesView = getArticlesView;
exports.getArticlesByIds = getArticlesByIds;
exports.getNewArticles = getNewArticles;
exports.getHotArticles = getHotArticles;
exports.getArticlesByUser = getArticlesByUser;
exports.getWeeksPost = getWeeksPost;
exports.getSolialLinks = getSolialLinks;

function beautifyArticleArray( articles ){
	articles = norseUtils.forceArray(articles);
	for( var i = 0; i < articles.length; i++ ){
		articles[i] = beautifyArticle(articles[i]);
	}
	return articles;
}

function getSolialLinks(){
    var site = portal.getSiteConfig();
    return thymeleaf.render(resolve('../pages/components/blog/socialLinks.html'), {social: site.social});
}

function getWeeksPost(){
    var site = portal.getSiteConfig();
    var article = contentLib.get({ key: site.weeksPost });
    article = beautifyArticle(article);
    return thymeleaf.render(resolve('../pages/components/blog/weeksPost.html'), {article: article});
}

function beautifyArticle( article ){
    article.image = norseUtils.getImage( article.data.image, 'block(767, 350)' );
    article.imageMobile = norseUtils.getImage( article.data.image, 'block(767, 350)' );
    article.imageDesktop = norseUtils.getImage( article.data.image, 'block(1920, 1080)' );
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
    articles = norseUtils.forceArray(articles);
    return thymeleaf.render(resolve('../pages/homePage/articleList.html'), {articles: articles});
}

function getArticlesByIds( ids, page ){
    var pageSize = 10;
    if( !page ){
        page = 0;
    }
    if( ids ){
        var result = [];
        ids = norseUtils.forceArray(ids);
        for( var i = page * pageSize; i < pageSize; i++ ){
            if( ids[i] ){
                var temp = contentLib.get({ key: ids[i] });
                if(temp){
                    result.push(temp);
                }
            }
        }
        result = beautifyArticleArray(result);
        return result;
    } else {
        return [];
    }
}

function getNewArticles( page ){
    var pageSize = 10;
    if( !page ){
        page = 0;
    }
    var result = contentLib.query({
        query: '',
        start: page * pageSize,
        count: pageSize,
        sort: 'publish.from DESC',
        contentTypes: [
            app.name + ':article'
        ]
    }).hits;
    result = beautifyArticleArray(result);
    return result;
}

function getHotArticles( page ){
    if( !page ){
        page = 0;
    }
    var hotIds = votesLib.getHotIds( page );
    return getArticlesByIds(hotIds);
}

function getArticlesByUser( id, page, count ){
    var pageSize = 10;
    if( !page ){
        page = 0;
    }
    var articles = contentLib.query({
        start: page * pageSize,
        count: pageSize,
        query: "data.author = '" + id + "'"
    });
    if( count ){
        return articles.total;
    }
    articles = articles.hits;
    articles = beautifyArticleArray(articles);
    return articles;
}