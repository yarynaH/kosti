var norseUtils = require('norseUtils');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var mailsLib = require('mailsLib');

exports.get = function( req ) {
    var params = req.params;
    var result = false;
    var view = resolve('newsletter.html');
    mailsLib.sendMail('newsletter', false, {});
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req)
        }),
        contentType: 'text/html'
    }
};