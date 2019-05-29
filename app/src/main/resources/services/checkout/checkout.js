var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var thymeleaf = require('/lib/thymeleaf');

var libLocation = '../../site/lib/';
var contextLib = require(libLocation + 'contextLib');
var norseUtils = require(libLocation + 'norseUtils');
var helpers = require(libLocation + 'helpers');
var cartLib = require(libLocation + 'cartLib');
var mailsLib = require(libLocation + 'mailsLib');

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
            modifyCart( model.cart._id, { status: "paid" });
            contextLib.runAsAdmin(function () {
                cartLib.modifyInventory(model.cart.items);
            });
        } else if( params.ik_inv_st == 'fail' || params.ik_inv_st == 'canceled' ){
            params.error = true;
            params.step = "3";
            modifyCart( model.cart._id, { status: "failed" });
        } else if( params.ik_inv_st == 'waitAccept' ){
            params.step = "pending";
            modifyCart( model.cart._id, { status: "pending" });
            contextLib.runAsAdmin(function () {
                cartLib.modifyInventory(model.cart.items);
            });
        }
    }
    switch(params.step){
        case '2':
            if( !model.cart.ik_id || model.cart.ik_id == '' ){
                params.ik_id = params.surname.toLowerCase() + '_' + new Date().getTime();
            }
            model.cart = modifyCart( model.cart._id, params );
            var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params, req, model.cart ));
            model.shipping = 'active';
            break;
        case '3':
            params.userId = cartLib.getNextId();
            params.status = 'created';
            var shipping = getShipping(model.cart.country);
            shipping = getShippingById( shipping, params.shipping );
            model.cart = modifyCart( model.cart._id, params );
            var stepView = thymeleaf.render( resolve('stepThree.html'), createStepThreeModel( params, req, model.cart ));
            model.payment = 'active';
            break;
        case 'submit':
            if( model.cart && model.cart.ik_id ){
                model.pay = true;
            }
            break;
        case 'success':
            return renderSuccessPage( req, model.cart, false );
            break;
        case 'pending':
            return renderSuccessPage( req, model.cart, true );
            break;
        default:
            var stepView = thymeleaf.render( resolve('stepOne.html'), createStepOneModel( params, model.cart, req ));
            model.info = 'active';
            break;
    }
    model.stepView = stepView;
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function modifyCart( id, params ){
        return contextLib.runAsAdmin(function () {
            return model.cart = cartLib.setUserDetails( id, params );
        });
    }

    function createStepOneModel( params, cart, req ) {
        return {
            shopUrl: getShopUrl(),
            agreementPage: portal.pageUrl({id: portal.getSiteConfig().agreementPage}),
            params: params,
            cart: cart
        };
    }

    function createStepTwoModel( params, req, cart ){
        var site = portal.getSiteConfig();
        var shipping = contentLib.get({ key: site.shipping });
        shipping = getShipping( params.country, cart.itemsWeight );
        return {
            params: params,
            shopUrl: getShopUrl(),
            shipping: shipping,
            cart: cart,
            address: params.country.replaceAll(' ', '+') + ',' + params.city.replaceAll(' ', '+') + ',' + params.address.replaceAll(' ', '+')
        };
    }

    function createStepThreeModel( params, req, cart ){
        return {
            shopUrl: getShopUrl(),
            cart: cart,
            error: params.error
        };
    }

    function getShipping( country, weight ){
        if( parseFloat(weight) === 0 ){
            return [{
                id: "digital",
                title: "Цифровая доставка",
                price: 0,
                terms: "Ваш заказ будет отправлен на Вашу електронную почту как только вы пройдете этап оплаты"
            }];
        }
        var site = portal.getSiteConfig();
        var shipping = contentLib.get({ key: site.shipping });
        var result = [];
        for( var i = 0; i < shipping.data.shipping.length; i++ ){
            if( shipping.data.shipping[i].country.indexOf(country) != -1 ){
                result = getShippingsWithPrices( shipping.data.shipping[i], country, weight );
            }
        }
        return result;
    }

    function getShippingsWithPrices( shipping, country, weight ){
        var result = [];
        shipping.methods = norseUtils.forceArray(shipping.methods);
        for( var j = 0; j < shipping.methods.length; j++ ){
            var price = cartLib.getShippingPrice({ 
                country: country,
                itemsWeight: weight,
                shipping: shipping.methods[j].id
            });
            result.push({
                id: shipping.methods[j].id,
                title: shipping.methods[j].title,
                price: price.toFixed(),
                terms: shipping.methods[j].terms
            });
        }
        return result;
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
        var site = portal.getSiteConfig();
        return {
            cart: cart,
            ik_id: site.ik_id,
            pageComponents: helpers.getPageComponents(req)
        };
    }

    function getShopUrl(){
        var site = portal.getSiteConfig();
        return portal.pageUrl({
            id: site.shopLocation
        });
    }

    function renderSuccessPage( req, cart, pendingPage ){
        if( !pendingPage ){
            /*cart = contextLib.runAsAdmin(function () {
                return cart = cartLib.generateItemsIds(cart._id);
            });*/
            mailsLib.sendMail('orderCreated', cart.email, {
                cart: cart
            });
        } else {
            mailsLib.sendMail('pendingItem', ['maxskywalker94@gmail.com', 'demura.vi@gmail.com'], {
                id: cart._id
            });
        }
        return {
            body: thymeleaf.render( resolve('success.html'), {
                pageComponents: helpers.getPageComponents(req),
                cart: cart,
                pendingPage: pendingPage,
                shopUrl: getShopUrl()
            }),
            contentType: 'text/html'
        };
    }
};