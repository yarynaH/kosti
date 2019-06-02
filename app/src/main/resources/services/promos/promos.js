var thymeleaf = require('/lib/thymeleaf');

var libLocation = '../../site/lib/';
var norseUtils = require(libLocation + 'norseUtils');
var helpers = require(libLocation + 'helpers');
var promosLib = require(libLocation + 'promosLib');
var cartLib = require(libLocation + 'cartLib');

exports.get = function(req){
	var params = req.params;
    var view = resolve('addPromo.html');
    var model = {
        pageComponents: helpers.getPageComponents(req)
    };
    return {
        body: thymeleaf.render(view, model),
        contentType: 'text/html'
    }
}

exports.post = function(req){
	var params = req.params;
    var view = resolve('addPromo.html');
    var action = params.action;
    delete params.action;
    switch(action){
        case 'addPromo':
            var model = {
                pageComponents: helpers.getPageComponents(req)
            };
            promosLib.addPromo(params);
            return {
                body: thymeleaf.render(view, model),
                contentType: 'text/html'
            }
        case 'checkPromo':
            return {
                body: promosLib.checkPromo(params.promo),
                contentType: 'application/json'
            }
        case 'activatePromo':
            return {
                body: promosLib.activatePromo(params.promoCode, params.cartId),
                contentType: 'application/json'
            }
        case 'removePromo':
            return {
                body: cartLib.removePromo(params.code, params.cartId),
                contentType: 'application/json'
            }
    }
}