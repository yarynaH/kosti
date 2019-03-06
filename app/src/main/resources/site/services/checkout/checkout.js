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
    var site = portal.getSiteConfig();
    var shopUrl = portal.pageUrl({
        id: site.shopLocation
    });
	if( params.step && params.step == '2' ){
        var order = null;
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                order = ordersLib.modifyOrder( model.cart.orderId, params );
            } else {
                params.cartId = model.cart._id;
                order = ordersLib.createOrder( params );
                model.cart = cartLib.setOrder( model.cart._id, order._id );
            }
        });
        var stepModel = createStepTwoModel( params, req );
        stepModel.shopUrl = shopUrl;
        var stepView = thymeleaf.render( resolve('stepTwo.html'), stepModel);
        model.shipping = 'active';
	} else if( params.step && params.step == '3' ){
        var stepModel = createStepThreeModel( params, req );
        stepModel.shopUrl = shopUrl;
        var stepView = thymeleaf.render( resolve('stepThree.html'), stepModel);
        var order = {};
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                params.step = 'created';
                order = ordersLib.getOrder( model.cart.orderId );
                var shipping = getShipping(order.country);
                shipping = getShippingById( shipping, params.shipping );
                model.cart = cartLib.setShipping( model.cart._id, shipping );
                order = ordersLib.modifyOrder( model.cart.orderId, params );
            }
        });
        model.payment = 'active';
	} else if( params.step && params.step == 'submit' ){
        var order = ordersLib.getOrder( model.cart.orderId );
        if( order && order.ik_id ){
            model.pay = true;
            model.ik_id = order.ik_id;
        }
        mailsLib.sendMail('orderCreated', order.email);
    } else {
        var order = {};
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                order = ordersLib.getOrder( model.cart.orderId );
            }
        });
        var stepModel = createStepOneModel( params, req );
        stepModel.shopUrl = shopUrl;
        var stepView = thymeleaf.render( resolve('stepOne.html'), stepModel);
        model.info = 'active';
	}
    model.stepView = stepView;
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function createStepOneModel( params ) {
        return {
            order: order,
            params: params
        };
    }

    function createStepTwoModel( params, req ){
        var site = portal.getSiteConfig();
        var shipping = contentLib.get({ key: site.shipping });
        shipping = getShipping( params.country );
        return {
            params: params,
            shipping: shipping,
            address: params.country.replaceAll(' ', '+') + ',' + params.city.replaceAll(' ', '+') + ',' + params.address.replaceAll(' ', '+')
        };
    }

    function createStepThreeModel( params, req ){
        return {
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
        return {
            cart: cart,
            pageComponents: helpers.getPageComponents(req)
        };
    }
};