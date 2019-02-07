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
    var model = getCheckoutMainModel( params );
	if( params.step && params.step == '2' ){
        var stepView = thymeleaf.render( resolve('stepTwo.html'), createStepTwoModel( params ));
        model.shipping = 'active';
	} else if( params.step && params.step == '3' ){
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
        return {
            product: getProduct(params.productId),
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
};