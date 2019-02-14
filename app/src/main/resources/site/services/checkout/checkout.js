var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');

exports.post = function( req ) {
	var params = req.params;
    var view = resolve('checkout.html');
    var model = getCheckoutMainModel( params );
	if( params.step && params.step == '2' ){
        var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params ));
        model.shipping = 'active';
	} else if( params.step && params.step == '3' ){
	} else if( params.step && params.step == 'submit' ){
        var order = {};
        contextLib.runAsAdmin(function () {
            order = createOrder(params);
        });
        if( order.ik_id ){
            model.pay = true;
            model.ik_id = order.ik_id;
        }
    } else {
        var stepView = thymeleaf.render( resolve('stepOne.html'), createStepOneModel( params ));
        model.info = 'active';
	}
    model.stepView = stepView;
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function createStepOneModel( params ) {
    	var product = contentLib.get({ key: params.productId });
    	product.image = norseUtils.getImage( product.data.mainImage, 'block(73, 73)' );
        return {
        	productId: params.productId,
            quantity: params.quantity,
            product: getProduct(params.productId)
        };
    }

    function createStepTwoModel( params ){
        var product = getProduct(params.productId);
        return {
            params: params,
            address: params.country.replaceAll(' ', '+') + ',' + params.city.replaceAll(' ', '+') + ',' + params.address.replaceAll(' ', '+'),
            product: product,
            total: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productId: params.productId
        };
    }

    function getCheckoutMainModel( params ){
        var product = getProduct(params.productId);
        return {
            cartProductsTotal: params.quantity,
            product: product,
            total: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productsTotal: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productId: params.productId,
            pageComponents: helpers.getPageComponents(req)
        };
    }

    function getProduct(productId){
        var product = contentLib.get({ key: params.productId });
        product.image = norseUtils.getImage( product.data.mainImage, 'block(73, 73)' );
        return product;
    }

    function createOrder( params ){
        var ordersRepo = nodeLib.connect({
            repoId: "orders",
            branch: "master"
        });
        params.step = 'created';
        params.ik_id = params.surname.toLowerCase() + '_' + new Date().getTime();
        return ordersRepo.create( params );
    }
};