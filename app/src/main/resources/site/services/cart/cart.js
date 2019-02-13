var norseUtils = require('norseUtils');
var userLib = require('userLib');
var cartLib = require('cartLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');

exports.post = function( req ) {
    var params = req.params;
    var result = false;
    switch (params.action){
        case 'get':
            result = cartLib.getCart( req.cookies.cartId );
            break;
        case 'modify':
            result = cartLib.modify( params.cartId, params.itemId, params.amount );
            break;
        default:
            break;
    }
    return {
        body: result,
        contentType: 'application/json'
    }
};
exports.get = function( req ) {
    var cart = cartLib.getCart( req.cookies.cartId );
    return {
        body: cart,
        contentType: 'text/html'
    }
};