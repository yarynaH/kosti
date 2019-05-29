var thymeleaf = require('/lib/thymeleaf');
var libs = {
    context: require('/lib/xp/context')
};
var libLocation = '../../lib/';

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require(libLocation + 'norseUtils');
var helpers = require(libLocation + 'helpers');

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
        var description = portal.getSite().data.description;
        var showDescription = true;

        if( up.email && up.email != '' ){
            var mailsLocation = contentLib.get({ key: site.mailsLocation, branch: 'draft' });
            if( !mailsLocation.data.mail || mailsLocation.data.mail.indexOf(up.email) == -1 ){
                var newMail = norseUtils.forceArray( mailsLocation.data.mail );
                newMail.push(up.email);
                var result = libs.context.run({
                    user: {
                        login: 'su'
                    },
                    principals: ["role:system.admin"]
                }, function() {
                    contentLib.modify({
                        key: mailsLocation._id,
                        branch: "draft",
                        editor: function(c){
                            c.data.mail = newMail;
                            return c;
                        }
                    });
                    var result = contentLib.publish({
                        keys: [mailsLocation._id],
                        sourceBranch: 'draft',
                        targetBranch: 'master'
                    });
                })
            }
            showDescription = false;
        }

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            social: site.social,
            pageComponents: helpers.getPageComponents(req),
            showDescription: showDescription
        };

        return model;


    }

    return renderView();
}