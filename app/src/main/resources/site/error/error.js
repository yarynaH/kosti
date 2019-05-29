var thymeleaf = require('/lib/thymeleaf');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var portal = require('/lib/xp/portal');

var viewGeneric = resolve('error.html');

exports.handleError = function (err) {
    var siteConfig = portal.getSiteConfig();
    var site = portal.getSite();
    var body = thymeleaf.render(viewGeneric, {
            pageComponents: helpers.getPageComponents( err ),
            social: siteConfig.social,
            lang: site.language,
            status: err.status
        });
    return {
        contentType: 'text/html',
        body: body
    }
};