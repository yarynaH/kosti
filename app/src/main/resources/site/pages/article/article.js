var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var kostiUtils = require('kostiUtils');
var thymeleaf = require('/lib/xp/thymeleaf');
var votesLib = require('votesLib');
var userLib = require('userLib');
var blogLib = require('blogLib');
var commentsLib = require('commentsLib');

exports.get = handleReq;

function handleReq(req) {
    var me = this;
    var user = userLib.getCurrentUser();

    function renderView() {
        var view = resolve('article.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
        var fileName = portal.assetUrl({path:'js/comments.js'});
         // Return the result
        return {
          body: body,
          contentType: 'text/html',
          pageContributions: {
            bodyEnd: [
                "<script src='"+fileName+"'></script>"
            ]
          }
        };
    }

    function createModel() {

        var up = req.params;
        var content = portal.getContent();
        content = blogLib.beautifyArticle(content);
        var response = [];
        var site = portal.getSiteConfig();
        var mainRegion = content.page.regions.main;
        var similarArticles = getSimilar( content.data.similarArticles );
        var comments = commentsLib.getCommentsByParent(content._id);
        comments = thymeleaf.render(resolve('comments.html'), {
            comments: comments, 
            articleId: content._id, 
            moderator: user.moderator
        });

        var model = {
            content: content,
            social: site.social,
            mainRegion: mainRegion,
            weeksPost: getWeeksPost(site.weeksPost),
            pageComponents: helpers.getPageComponents(req),
            similarArticles: similarArticles,
            comments: comments,
            bookmarked: userLib.checkIfBookmarked(content._id)
        };

        return model;
    }

    function getWeeksPost( weeksPost ){
        var weeksPost = contentLib.get({ key: weeksPost });
        weeksPost = blogLib.beautifyArticle(weeksPost);
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