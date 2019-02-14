var thymeleaf = require('/lib/xp/thymeleaf');
var authLib = require('/lib/xp/auth');
var cartLib = require('cartLib');

var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var norseUtils = require('norseUtils');
var helpers = require('helpers');
var userLib = require('userLib');
var spellLib = require('spellsLib');

exports.get = handleReq;
exports.post = handleReq;

function handleReq(req) {
    var me = this;

    function renderView() {
        var view = resolve('product.html');
        var model = createModel();
        var body = thymeleaf.render(view, model);
        return {
          body: body,
          contentType: 'text/html'
        };
    }

    function createModel() {
        var up = req.params;
        var content = portal.getContent();
        var response = [];
        var site = portal.getSiteConfig();

        var model = {
            content: content,
            app: app,
            cart: cartLib.getCart(req.cookies.cartId),
            mainImage: getMainImage( content.data ),
            images: getImages( content.data ),
            social: site.social,
            sizes: getSizes(content.data.sizes),
            pageComponents: helpers.getPageComponents(req)
        };
        return model;
    }

    function getImages( data ){
        var images = [];
        if( data.images ){
            for( var i = 0; i < data.images.length; i++ ){
                images.push( norseUtils.getImage( data.images[i], '(1, 1)' ));
            }
        }
        return images;
    }

    function getMainImage( data ){
        var image = null;
        if( data.mainImage ){
            image = norseUtils.getImage( data.mainImage, '(1, 1)' );
        }
        return image;
    }

    function getSizes(sizes){
        var result = [];
        for ( var size in sizes ) {
            if( sizes.hasOwnProperty(size) && sizes[size] == true ) {
                result.push(size);
            }
        }
        return result;
    }

    return renderView();
}