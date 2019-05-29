var thymeleaf = require('/lib/thymeleaf');
var portal = require('/lib/xp/portal');

var libLocation = '../../lib/';
var helpers = require(libLocation + 'helpers');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('contentPage.html');
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
        var mainRegion = content.page.regions.main;

        var model = {
            content: content,
            app: app,
            mainRegion: mainRegion,
            pageComponents: helpers.getPageComponents(req)
        };

        return model;


    }

    return renderView();
}