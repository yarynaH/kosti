var thymeleaf = require('/lib/xp/thymeleaf');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var userLib = require('userLib');
var kostiUtils = require('kostiUtils');
var httpClientLib = require('/lib/xp/http-client');
var blogLib = require('blogLib');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;
    var user = userLib.getCurrentUser();

    function renderView() {
        var view = resolve('homePage.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
        var fileName = portal.assetUrl({path:'js/homepage.js'});
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
        var response = [];
        var site = portal.getSiteConfig();
        var description = portal.getSite().data.description;
        var showDescription = true;
        var schedule = getSchedule(site.slider);
        var video = getVideoViaApi( site.gApiKey );
        var active = {};
        switch(up.feed){
            case 'new':
                active.new = 'active';
                var articles = blogLib.getNewArticles();
                break;
            case 'bookmarks':
                active.bookmarks = 'active';
                var articles = blogLib.getArticlesByIds( user.data.bookmarks );
                break;
            default:
                active.hot = 'active';
                var articles = blogLib.getHotArticles();
                break;
        }

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            video: video ? "https://www.youtube.com/embed/" + video : getVideoUrl( site.video ),
            weeksPost: getWeeksPost(site.weeksPost),
            schedule: schedule,
            social: site.social,
            active: active,
            pageComponents: helpers.getPageComponents(req),
            showDescription: showDescription,
            slider: getSliderArticles(site.slider),
            articles: blogLib.getArticlesView(articles)
        };

        return model;

        function getSchedule(){
            var scheduleLocation = contentLib.get({ key: site.scheduleLocation });
            var now = new Date().toISOString();
            var result = contentLib.query({
                query: "data.date > dateTime('" + now + "')",
                start: 0,
                count: 3,
                sort: 'data.date ASC',
                contentTypes: [
                    app.name + ":schedule"
                ]
            }).hits;
            for( var i = 0; i < result.length; i++ ){
                result[i].image = norseUtils.getImage( result[i].data.image, 'block(301, 109)' );
                var itemDate = new Date(result[i].data.date);
                result[i].month = norseUtils.getMonthName(itemDate);
                result[i].day = itemDate.getDate().toFixed();
            }
            return result;
        }

        function getSliderArticles( articles ){
            var result = [];
            for( var i = 0; i < articles.length; i++ ){
                var temp = contentLib.get({ key: articles[i] });
                result[i] = blogLib.beautifyArticle(temp);
            }
            return result;
        }

        function getWeeksPost( weeksPost ){
            var weeksPost = contentLib.get({ key: weeksPost });
            weeksPost = blogLib.beautifyArticle(weeksPost);
            return weeksPost;
        }

        function getVideoViaApi( key ){
            var response = JSON.parse(httpClientLib.request({
                url: "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCETKVT-Uj-gAqdSTd2YNaMg&maxResults=1&order=date&type=video&key=" + key,
                method: "GET",
                headers: {
                    'X-Custom-Header': 'header-value'
                },
                connectionTimeout: 2000000,
                readTimeout: 500000,
                contentType: 'application/json'
            }).body);
            if( response.items && response.items[0] && response.items[0].id && response.items[0].id.videoId ){
                return response.items[0].id.videoId;
            }
            return false;
        }

        function getVideoUrl( url ){
            url = url.split('/');
            url = url[url.length-1];

            if( url.split('?v=')[1] ){
                return 'https://www.youtube.com/embed/' + url.split('?v=')[1];
            }else{
                return 'https://www.youtube.com/embed/' + url;
            }
        }
    }
    return renderView();
}