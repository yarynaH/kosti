var thymeleaf = require('/lib/thymeleaf');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var portal = require('/lib/xp/portal');

var viewGeneric = resolve('error.html');
var view404  = resolve('404.html');
var view401  = resolve('401.html');

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

exports.handle404 = function (err) {
    var body = thymeleaf.render(view404, {
            pageComponents: helpers.getPageComponents( err )
        });
    return {
        contentType: 'text/html',
        body: body
    }
};

exports.handle401 = function (err) {
    var body = thymeleaf.render(view401, {
            pageComponents: helpers.getPageComponents( err )
        });
    return {
        contentType: 'text/html',
        body: body
    }
};