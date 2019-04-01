var norseUtils = require('norseUtils');
var userLib = require('userLib');
var cartLib = require('cartLib');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');
var qrLib = require('qrLib');
var hashLib = require('hashLib');
var htmlExporter = require('/lib/openxp/html-exporter');
var textEncodingLib = require('/lib/text-encoding');
var mailsLib = require('mailsLib');

exports.get = function( req ) {
    var params = req.params;
    switch( params.action ){
        case 'addItem':
            cartLib.modify( params.id, params.itemID, params.amount, params.size, true );
            break;
        case 'regenerateIds':
            cartLib.generateItemsIds(params.id);
            break;
        default:
            break;
    }
    var view = resolve('orders.html');
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req),
            cart: cartLib.getCart( params.id )
        }),
        contentType: 'text/html'
    }
};
exports.post = function( req ) {
    var params = req.params;
    switch( params.action ){
        case 'addItem':
            if( params.size.trim() == '' ){
                params.size = null;
            }
            cartLib.modify( params.id, params.itemID, params.amount, params.size, true );
            break;
        case 'regenerateIds':
            cartLib.generateItemsIds(params.id);
            break;
        case 'setStatus':
            cartLib.setUserDetails(params.id, {status: params.status});
            break;
        default:
            break;
    }
    var view = resolve('orders.html');
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req),
            cart: cartLib.getCart( params.id )
        }),
        contentType: 'text/html'
    }
};