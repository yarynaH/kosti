var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var portalLib = require('/lib/xp/portal');
var nodeLib = require('/lib/xp/node');
var contextLib = require('contextLib');
var userLib = require('userLib');
var kostiUtils = require('kostiUtils');
var sharedLib = require('sharedLib');

exports.addPromo = addPromo;
exports.getPromosArray = getPromosArray;
exports.getPromoByCode = getPromoByCode;
exports.activatePromo = activatePromo;

function addPromo( data ){
	var promoRepo = sharedLib.connectRepo('promos');
	return promoRepo.create( data );
}

function checkPromo( code ){
	var promo = getPromoByCode(code);
	return promo;
}

function getPromosArray( codes ){
	var result = [];
	codes = norseUtils.forceArray(codes);
	for( var i = 0; i < codes.length; i++ ){
		result.push(getPromoByCode(codes[i]));
	}
	return result;
}

function getPromoByCode( code ){
	var promoRepo = sharedLib.connectRepo('promos');
	var result = promoRepo.query({
	    start: 0,
	    count: 1,
	    query: "promoName = '" + code + "'"
	});
	if( result && result.hits && result.total > 0 ){
		return promoRepo.get(result.hits[0].id);
	}
	return false;
}

function activatePromo( code, cartId ){
	var promo = getPromoByCode(code);
	if( !promo || !promo.discount ){
		return false;
	}
	var cartLib = require('cartLib');
	return cartLib.addPromo(code, cartId);
}
