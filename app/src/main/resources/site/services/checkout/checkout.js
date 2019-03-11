var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');
var cartLib = require('cartLib');
var ordersLib = require('ordersLib');
var mailsLib = require('mailsLib');

exports.get = function( req ) {
    return generateCheckoutPage(req);
}

exports.post = function( req ) {
    return generateCheckoutPage(req);
}

function generateCheckoutPage(req){
	var params = req.params;
    var view = resolve('checkout.html');
    var model = getCheckoutMainModel( params );
    if( params.ik_inv_st ){
        if( params.ik_inv_st == 'success' ){
            params.step = "success";
        } else if( params.ik_inv_st == 'fail' || params.ik_inv_st == 'canceled' ){
            params.error = true;
            params.step = "3";
        }
    }
    switch(params.step){
        case '2':
            if( !model.order || !model.order._id ){
                contextLib.runAsAdmin(function () { 
                    params.cartId = model.cart._id;
                    model.order = ordersLib.createOrder( params );
                    model.cart = cartLib.setOrder( model.cart._id, model.order._id );
                });
            }
            var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params, req ));
            model.shipping = 'active';
            break;
        case '3':
            contextLib.runAsAdmin(function () {
                params.step = 'created';
                var shipping = getShipping(model.order.country);
                shipping = getShippingById( shipping, params.shipping );
                model.cart = cartLib.setShipping( model.cart._id, shipping );
                model.order = ordersLib.modifyOrder( model.cart.orderId, params );
            });
            var stepView = thymeleaf.render( resolve('stepThree.html'), createStepThreeModel( params, req ));
            model.payment = 'active';
            break;
        case 'submit':
            if( model.order && model.order.ik_id ){
                model.pay = true;
                model.ik_id = model.order.ik_id;
            }
            break;
        case 'success':
            return renderSuccessPage( req, model.cart );
            break;
        default:
            var stepView = thymeleaf.render( resolve('stepOne.html'), createStepOneModel( params, req, model.order ));
            model.info = 'active';
            break;
    }
    model.stepView = stepView;
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function createStepOneModel( params, req, order ) {
        return {
            shopUrl: getShopUrl(),
            agreementPage: portal.pageUrl({id: portal.getSiteConfig().agreementPage}),
            order: order,
            params: params
        };
    }

    function createStepTwoModel( params, req, shopUrl ){
        var site = portal.getSiteConfig();
        var shipping = contentLib.get({ key: site.shipping });
        shipping = getShipping( params.country );
        return {
            params: params,
            shopUrl: getShopUrl(),
            shipping: shipping,
            address: params.country.replaceAll(' ', '+') + ',' + params.city.replaceAll(' ', '+') + ',' + params.address.replaceAll(' ', '+')
        };
    }

    function createStepThreeModel( params, req ){
        return {
            shopUrl: getShopUrl(),
            error: params.error
        };
    }

    function getShipping( country ){
        var site = portal.getSiteConfig();
        var shipping = contentLib.get({ key: site.shipping });
        for( var i = 0; i < shipping.data.shipping.length; i++ ){
            if( shipping.data.shipping[i].country == country ){
                return norseUtils.forceArray(shipping.data.shipping[i].methods);
            }
        }
        return shipping;
    }

    function getShippingById( shipping, id ){
        for( var i = 0; i < shipping.length; i++ ){
            if( shipping[i].id == id ){
                return shipping[i];
            }
        }
    }

    function getCheckoutMainModel( params ){
        var cart = cartLib.getCart(req.cookies.cartId);
        var order = contextLib.runAsAdmin(function () {
            if( cart && cart.orderId && cart.orderId != '' ){
                return ordersLib.getOrder( cart.orderId );
            } else {
                return {};
            }
        });
        return {
            cart: cart,
            order: order,
            pageComponents: helpers.getPageComponents(req)
        };
    }

    function getShopUrl(){
        var site = portal.getSiteConfig();
        return portal.pageUrl({
            id: site.shopLocation
        });
    }

    function renderSuccessPage( req, cart ){
        var order = ordersLib.getOrder( cart.orderId );
        mailsLib.sendMail('orderCreated', order.email, {
            order: order,
            cart: cart
        });
        return {
            body: thymeleaf.render( resolve('success.html'), {
                pageComponents: helpers.getPageComponents(req),
                order: order,
                shopUrl: getShopUrl()
            }),
            contentType: 'text/html'
        };
    }
};