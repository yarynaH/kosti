var thymeleaf = require('/lib/xp/thymeleaf');
var libs = {
    context: require('/lib/xp/context')
};

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var spellLib = require('spellsLib');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('spell.html');
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

        var model = {
            content: content,
            url: portal.pageUrl({ path: content._path }),
            app: app,
            social: site.social,
            classes: spellLib.generateClasses( content.data.classes ),
            components: spellLib.generateComponents( content.data.misc ),
            castTime: spellLib.generateCastTime( content.data.castTime, content.data.otherCastTime, content.data.castTimeDescr, content.language ),
            range: spellLib.generateDistance( content.data.range, content.data.rangeDistance, content.data.rangeDistanceUnits, content.data.rangeDescr, content.language ),
            pageComponents: helpers.getPageComponents(req)
        };

        return model;


    }

    return renderView();
}