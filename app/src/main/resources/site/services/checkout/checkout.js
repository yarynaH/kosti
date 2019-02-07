var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.post = function( req ) {
	var params = req.params;
    var view = resolve('checkout.html');
	if( params.step && params.step == '2' ){
        var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params ));
	} else if( params.step && params.step == '3' ){
	} else {
        var stepView = thymeleaf.render( resolve('stepOne.html'), createStepOneModel( params ));
	}
    var model = getCheckoutMainModel( params );
    model.stepView = stepView;
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    };

    function createStepOneModel( params ) {
    	var product = contentLib.get({ key: params.productId });
    	product.image = norseUtils.getImage( product.data.mainImage, 'block(73, 73)' );
        return {
        	cartProductsTotal: params.quantity,
        	productId: params.productId,
        	total: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
        	productsTotal: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            quantity: params.quantity,
            product: product
        };
    }

    function createStepTwoModel( params ){
        var product = contentLib.get({ key: params.productId });
        product.image = norseUtils.getImage( product.data.mainImage, 'block(73, 73)' );
        return {
            cartProductsTotal: params.quantity,
            product: product,
            total: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productsTotal: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productId: params.productId
        };
    }

    function getCheckoutMainModel( params ){
        var product = contentLib.get({ key: params.productId });
        product.image = norseUtils.getImage( product.data.mainImage, 'block(73, 73)' );
        return {
            cartProductsTotal: params.quantity,
            product: product,
            total: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productsTotal: (parseInt(params.quantity) * parseInt(product.data.price)).toFixed(),
            productId: params.productId,
            pageComponents: helpers.getPageComponents(req)
        };
    }
};