var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var libLocation = '../../lib/';
var norseUtils = require(libLocation + 'norseUtils');
var helpers = require(libLocation + 'helpers');
var kostiUtils = require(libLocation + 'kostiUtils');
var votesLib = require(libLocation + 'votesLib');
var userLib = require(libLocation + 'userLib');

exports.get = handleReq;

function handleReq(req) {
    var me = this;
    var user = userLib.getCurrentUser();

    function renderView() {
        var view = resolve('article.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
         // Return the result
        return {
          body: body,
          contentType: 'text/html'
        };
    }

    function createModel() {

        var up = req.params;
        var content = portal.getContent();
        content = beautifyArticle(content);
        var response = [];
        var site = portal.getSiteConfig();
        var mainRegion = content.page.regions.main;
        var similarArticles = getSimilar( content.data.similarArticles );

        var model = {
            content: content,
            social: site.social,
            mainRegion: mainRegion,
            weeksPost: getWeeksPost(site.weeksPost),
            pageComponents: helpers.getPageComponents(req),
            similarArticles: similarArticles,
            bookmarked: userLib.checkIfBookmarked(content._id)
        };

        return model;
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
        if( parseInt(article.votes) > 0 ){
            article.voted = votesLib.checkIfVoted( article._id );
        }
        return article;
    }

    function getWeeksPost( weeksPost ){
        var weeksPost = contentLib.get({ key: weeksPost });
        weeksPost = beautifyArticle(weeksPost);
        return weeksPost;
    }

    function getSimilar( ids ){
        if( ids ){
            var result = [];
            ids = norseUtils.forceArray(ids);
            for( var i = 0; i < ids.length; i++ ){
                var article = contentLib.get({ key: ids[i] });
                if( article ){
                    result.push({
                        _id: article._id,
                        url: portal.pageUrl({ path: article._path }),
                        displayName: article.displayName,
                        votes: votesLib.countUpvotes( article._id ),
                        voted: votesLib.checkIfVoted( article._id )
                    });
                }
            }
            return result;
        } else {
            return false;
        }
    }

    return renderView();
}