var thymeleaf = require('/lib/xp/thymeleaf');

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('comingSoon.html');
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
        var showDescription = true;

        if( up.email && up.email != '' ){
            var mailsLocation = contentLib.get({ key: site.mailsLocation });
            if( !mailsLocation.data.mail || mailsLocation.data.mail.indexOf(up.email) == -1 ){
                var result = contentLib.modify({
                    key: mailsLocation._id,
                    editor: function(c){
                        var newMail = norseUtils.forceArray( c.data.mail );
                        newMail.push( up.email );
                        c.data.mail = newMail;
                        return c;
                    }
                });
            }
            showDescription = false;
        }

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            social: site.social,
            showDescription: showDescription
        };

        return model;


    }

    return renderView();
}