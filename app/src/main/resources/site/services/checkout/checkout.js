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
	if( params.step && params.step == '2' ){
        var order = null;
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                order = ordersLib.modifyOrder( model.cart.orderId, params );
            } else {
                order = ordersLib.createOrder( params );
                model.cart = cartLib.setOrder( model.cart._id, order._id );
            }
        });
        var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params, req ));
        model.shipping = 'active';
	} else if( params.step && params.step == '3' ){
	} else if( params.step && params.step == 'submit' ){
        var order = {};
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                params.step = 'created';
                order = ordersLib.modifyOrder( model.cart.orderId, params );
            }
        });
        if( order && order.ik_id ){
            model.pay = true;
            model.ik_id = order.ik_id;
        }
    } else {
        var order = {};
        contextLib.runAsAdmin(function () {
            if( model.cart && model.cart.orderId && model.cart.orderId != '' ){
                order = ordersLib.getOrder( model.cart.orderId );
            }
        });
        var stepView = thymeleaf.render( resolve('stepOne.html'), createStepOneModel( params, order ));
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
        return {
            params: params,
            address: params.country.replaceAll(' ', '+') + ',' + params.city.replaceAll(' ', '+') + ',' + params.address.replaceAll(' ', '+')
        };
    }

    function getCheckoutMainModel( params ){
        var cart = cartLib.getCart(req.cookies.cartId);
        return {
            cart: cart,
            pageComponents: helpers.getPageComponents(req)
        };
    }
};