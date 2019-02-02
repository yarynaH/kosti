var thymeleaf = require('/lib/xp/thymeleaf');
var authLib = require('/lib/xp/auth');
var libs = {
    context: require('/lib/xp/context')
};

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var userLib = require('userLib');
var spellLib = require('spellsLib');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('product.html');
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

        var model = {
            content: content,
            app: app,
            social: site.social,
            pageComponents: helpers.getPageComponents(req)
        };

        return model;


    }

    return renderView();
}