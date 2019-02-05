var thymeleaf = require('/lib/xp/thymeleaf');
var libs = {
    context: require('/lib/xp/context')
};

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var mailLib = require('/lib/xp/mail');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('homePage.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
        return {
          body: body,
          contentType: 'text/html'
        };
    }

    function createModel() {
        var up = req.params;
        var content = portal.getContent();
        var response = [];
        var site = portal.getSiteConfig();
        var description = portal.getSite().data.description;
        var showDescription = true;
        var schedule = getSchedule(site.slider);

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            weeksPost: getWeeksPost(site.weeksPost),
            schedule: schedule,
            social: site.social,
            pageComponents: helpers.getPageComponents(req),
            showDescription: showDescription,
            slider: getSliderArticles(site.slider),
            articles: getArticles()
        };

        return model;

        function getSchedule(){
            var scheduleLocation = contentLib.get({ key: site.scheduleLocation });
            var result = contentLib.getChildren({
                key: site.scheduleLocation,
                start: 0,
                count: 3,
                sort: 'data.date ASC'
            }).hits;
            for( var i = 0; i < result.length; i++ ){
                result[i].image = norseUtils.getImage( result[i].data.image, 'block(301, 109)' );
                var itemDate = new Date(result[i].data.date);
                result[i].month = norseUtils.getMonthName(itemDate);
                result[i].day = itemDate.getDate().toFixed();
            }
            return result;
        }

        function getArticles(){
            var result = contentLib.query({
                query: '',
                start: 0,
                count: 3,
                sort: 'data.date ASC',
                contentTypes: [
                    app.name + ':article'
                ]
            }).hits;
            for( var i = 0; i < result.length; i++ ){
                result[i] = beautifyArticle(result[i]);
            }
            return result;
        }

        function getSliderArticles( articles ){
            var result = [];
            for( var i = 0; i < articles.length; i++ ){
                var temp = contentLib.get({ key: articles[i] });
                result[i] = beautifyArticle(temp);
            }
            return result;
        }

        function getWeeksPost( weeksPost ){
            var weeksPost = contentLib.get({ key: weeksPost });
            weeksPost = beautifyArticle(weeksPost);
            return weeksPost;
        }

        function beautifyArticle( article ){
            article.image = norseUtils.getImage( article.data.image, '(1, 1)' );
            var itemDate = new Date(article.data.date);
            article.author = contentLib.get({ key: article.data.author });
            article.author.image = norseUtils.getImage( article.author.data.userImage, 'block(60, 60)' );
            return article;
        }


    }

    return renderView();
}