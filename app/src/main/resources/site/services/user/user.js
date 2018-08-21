var libs = {
    norseUtils: require('norseUtils'),
    content: require('/lib/xp/content'),
    context: require('/lib/xp/context')
};
var contentLib = require('/lib/xp/content');

exports.get = function( req ) {
    var result = false;
    libs.norseUtils.log('12345');
    return {
        body: result,
        contentType: 'text/html'
    }
};