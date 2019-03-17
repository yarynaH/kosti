var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var kostiUtils = require('kostiUtils');
var thymeleaf = require('/lib/xp/thymeleaf');
var votesLib = require('votesLib');

exports.get = handleReq;

function handleReq(req) {
    var me = this;

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

        var model = {
            content: content,
            social: site.social,
            pageComponents: helpers.getPageComponents(req)
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
            article.voted = votesLib.checkIfVoted( user.key, article._id );
        }
        return article;
    }

    return renderView();
}