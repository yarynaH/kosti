var norseUtils = require('norseUtils');
var userLib = require('userLib');
var portal = require('/lib/xp/portal');
var contextLib = require('/lib/contextLib');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');

exports.post = function( req ) {
	var params = req.params;
	if( params.step && params.step == '2' ){
	    var view = resolve('stepTwo.html');
	    var model = createStepTwoModel( params );
	    norseUtils.log(params);
	} else if( params.step && params.step == '3' ){
	} else {
	    var view = resolve('stepOne.html');
	    var model = createStepOneModel( params );
	}
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
            pageComponents: helpers.getPageComponents(req),
            product: product
        };
    }

    function createStepTwoModel( params ){
        return {
            pageComponents: helpers.getPageComponents(req)
        };
    }
};