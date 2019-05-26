var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var votesLib = require('votesLib');
var blogLib = require('blogLib');
var userLib = require('userLib');
var helpers = require('helpers');
var commentsLib = require('commentsLib');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('user.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
        var commentsScript = portal.assetUrl({path:'js/comments.js'});
        var userPageScript = portal.assetUrl({path:'js/userpage.js'});
        return {
          body: body,
          contentType: 'text/html',
          pageContributions: {
            bodyEnd: [
                "<script src='"+userPageScript+"'></script>",
                "<script src='"+commentsScript+"'></script>",
            ]
          }
        };
    }

    function createModel() {

        var up = req.params;
        var content = portal.getContent();
        content.image = norseUtils.getImage( content.data.userImage, 'block(140,140)', 1 );
        var currUser = userLib.getCurrentUser();
        var userSystemObj = userLib.getSystemUser(content.data.email);
        content.votes = votesLib.countUserUpvotes(userSystemObj.key);
        var date = new Date(content.publish.from.replace('Z', ''));
        content.date = date.getDate() + ' ' + norseUtils.getMonthName(date) + ' ' + date.getFullYear();
        var response = [];
        var userComments = commentsLib.getCommentsByUser(content._id);
        var totalArticles = {
            articles: blogLib.getArticlesByUser(content._id, 0, true)
        };

        var active = {};
        if( up.action == 'bookmarks' ){
            active.bookmarks = 'active';
            totalArticles.curr = content.data.bookmarks.length;
            var articles = blogLib.getArticlesView(blogLib.getArticlesByIds( content.data.bookmarks ));
        } else if( up.action == 'comments' ){
            active.comments = 'active';
            totalArticles.curr = userComments.length;
            var articles = thymeleaf.render(resolve('commentsView.html'), {comments: userComments});
        } else {
            active.articles = 'active';
            totalArticles.curr = totalArticles.articles;
            var articles = blogLib.getArticlesView(blogLib.getArticlesByUser(content._id));
        }
        var currUser = currUser.key == userSystemObj.key;
        if( currUser ){
            var editUserModal = thymeleaf.render(resolve('userEditModal.html'), {user: content});
        }

        var model = {
            content: content,
            currUser: currUser,
            app: app,
            userComments: userComments,
            totalArticles: totalArticles,
            articles: articles,
            active: active,
            editUserModal: editUserModal,
            articlesView: articles,
            pageComponents: helpers.getPageComponents(req)
        };

        return model;


    }

    return renderView();
}