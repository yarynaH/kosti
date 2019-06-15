var thymeleaf = require('/lib/thymeleaf');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var valueLib = require('/lib/xp/value');

var libLocation = '../../lib/';
var norseUtils = require(libLocation + 'norseUtils');
var moment = require(libLocation + 'moment');
var votesLib = require(libLocation + 'votesLib');
var blogLib = require(libLocation + 'blogLib');
var userLib = require(libLocation + 'userLib');
var helpers = require(libLocation + 'helpers');
var commentsLib = require(libLocation + 'commentsLib');

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
        var date = new Date(moment(content.publish.from.replace('Z', '')));
        content.date = date.getDate() + ' ' + norseUtils.getMonthName(date) + ' ' + date.getFullYear();
        var response = [];
        var userComments = commentsLib.getCommentsByUser(content._id);
        var totalArticles = {
            articles: blogLib.getArticlesByUser(content._id, 0, true)
        };

        var active = {};
        if( up.action == 'bookmarks' ){
            active.bookmarks = 'active';
            totalArticles.curr = content.data.bookmarks ? content.data.bookmarks.length : 0;
            var currTitle = 'articles';
            var articles = blogLib.getArticlesView(blogLib.getArticlesByIds( content.data.bookmarks ));
        } else if( up.action == 'comments' ){
            active.comments = 'active';
            totalArticles.curr = userComments.length;
            var currTitle = 'comments';
            var articles = thymeleaf.render(resolve('commentsView.html'), {comments: userComments});
        } else {
            active.articles = 'active';
            totalArticles.curr = totalArticles.articles;
            var currTitle = 'articles';
            var articles = blogLib.getArticlesView(blogLib.getArticlesByUser(content._id));
        }
        var currUser = currUser.key == userSystemObj.key;
        if( currUser ){
            var editUserModal = thymeleaf.render(resolve('userEditModal.html'), {user: content});
        }

        var model = {
            content: content,
            currUser: currUser,
            currTitle: currTitle,
            app: app,
            userComments: userComments,
            totalArticles: totalArticles,
            articles: articles,
            active: active,
            editUserModal: editUserModal,
            articlesView: articles,
            pageComponents: helpers.getPageComponents(req, "footerBlog")
        };

        return model;


    }

    return renderView();
}