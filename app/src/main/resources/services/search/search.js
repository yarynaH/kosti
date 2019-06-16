var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var libLocation = '../../site/lib/';
var norseUtils = require(libLocation + 'norseUtils');
var helpers = require(libLocation + 'helpers');
var blogLib = require(libLocation + 'blogLib');

exports.get = function( req ) {
    var params = req.params;
    var view = resolve('search.html');
    var site = portal.getSiteConfig();
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req),
            sidebar: blogLib.getSidebar(),
            query: params.q,
            searchRes: blogLib.getSearchArticles(params.q)
        }),
        contentType: 'text/html'
    }
};