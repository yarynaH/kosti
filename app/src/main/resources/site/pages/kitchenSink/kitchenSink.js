var thymeleaf = require('/lib/xp/thymeleaf');
var libs = {
    context: require('/lib/xp/context')
};

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('kitchenSink.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
         // Return the result
        return {
          body: body,
          //contentType: 'application/json',
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

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            description: description,
            social: site.social,
            showDescription: showDescription
        };

        return model;


    }

    return renderView();
}