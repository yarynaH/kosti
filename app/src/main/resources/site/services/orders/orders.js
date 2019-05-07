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
    var view = resolve('orders.html');
    switch( params.action ){
        case 'addItem':
            cartLib.modify( params.id, params.itemID, params.amount, params.size, true );
            break;
        case 'regenerateIds':
            cartLib.generateItemsIds(params.id);
            break;
        case 'resendConfirmationMail':
            var cart = cartLib.getCart(params.id);
            mailsLib.sendMail('orderCreated', cart.email, {
                cart: cart
            });
            break;
        case 'details':
            break;
        case 'readQr':
            view = resolve('readQr.html');
            return {
                body: thymeleaf.render(view, {
                    pageComponents: helpers.getPageComponents(req),
                }),
                contentType: 'text/html'
            }
            break;
        case 'emails':
            var carts = cartLib.getCreatedCarts();
            var result = [];
            for( var i = 0; i < carts.length; i++ ){
                if( carts[i].status == 'paid' ){
                    result.push(carts[i]);
                }
            }
            return {
                body: thymeleaf.render(resolve('emails.html'), { orders: result, }),
                contentType: 'text/html'
            }
            break;
        default:
            var carts = cartLib.getCreatedCarts();
            view = resolve('ordersList.html');
            return {
                body: thymeleaf.render(view, {
                    pageComponents: helpers.getPageComponents(req),
                    carts: carts
                }),
                contentType: 'text/html'
            }
            break;
    }
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req),
            cart: cartLib.getCart( params.id ),
            carts: carts,
            products: contentLib.query({start: 0,count: 999999,contentTypes: [app.name + ":product"]}).hits
        }),
        contentType: 'text/html'
    }
};
exports.post = function( req ) {
    var params = req.params;
    var view = resolve('orders.html');
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
        case 'details':
            break;
        case 'findbyqr':
            return {
                body: thymeleaf.render(resolve('markQr.html'), {
                    pageComponents: helpers.getPageComponents(req),
                    cart: cartLib.getCartByQr( params.qr ),
                }),
                contentType: 'text/html'
            }
            break;
        case 'markqr':
            cartLib.markTicketUsed(params.qr);
            return {
                body: thymeleaf.render(resolve('markQr.html'), {
                    pageComponents: helpers.getPageComponents(req),
                    cart: cartLib.getCartByQr( params.qr ),
                }),
                contentType: 'text/html'
            }
            break;
        case 'resendConfirmationMail':
            var cart = cartLib.getCart(params.id);
            mailsLib.sendMail('orderCreated', cart.email, {
                cart: cart
            });
            break;
        default:
            view = resolve('ordersList.html');
            return {
                body: thymeleaf.render(view, {
                    pageComponents: helpers.getPageComponents(req),
                    carts: carts
                }),
                contentType: 'text/html'
            }
            break;
    }
    return {
        body: thymeleaf.render(view, {
            pageComponents: helpers.getPageComponents(req),
            cart: cartLib.getCart( params.id ),
            products: contentLib.query({start: 0,count: 999999,contentTypes: [app.name + ":product"]}).hits
        }),
        contentType: 'text/html'
    }
};