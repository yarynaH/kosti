var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');

exports.post = function( req ) {
    return {
        body: JSON.stringify(req, undefined, 4),
        contentType: 'text/html'
    }
};