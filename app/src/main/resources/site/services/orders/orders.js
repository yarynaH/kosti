var norseUtils = require('norseUtils');
var userLib = require('userLib');
var cartLib = require('cartLib');
var portal = require('/lib/xp/portal');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');
var thymeleaf = require('/lib/xp/thymeleaf');
var nodeLib = require('/lib/xp/node');
var contextLib = require('/lib/contextLib');
var qrLib = require('qrLib');

exports.get = function( req ) {
    var params = req.params;
    switch(params.action){
        case 'testOrderMail':
            var result = false;
            var view = resolve('../../pages/mails/orderCreated.html');
            var site = portal.getSiteConfig();
            var shopUrl = portal.pageUrl({
                id: site.shopLocation
            });
            return {
                body: thymeleaf.render(view, {
                    cart: cartLib.getCart( req.cookies.cartId ),
                    site: portal.getSite()
                }),
                contentType: 'text/html'
            }
        case 'pdfPage':
            var typeNumber = 4;
            var errorCorrectionLevel = 'L';
            var qr = qrLib(typeNumber, errorCorrectionLevel);
            qr.addData('Hi! Its me, Max!');
            qr.make();
            var code = qr.createTableTag(7);
            return {
                body: thymeleaf.render(resolve("../../pages/pdfs/ticket.html"), {qrcode: code}),
                contentType: 'text/html'
            }
        case 'pdfPageFile':
            var typeNumber = 4;
            var errorCorrectionLevel = 'L';
            var qr = qrLib(typeNumber, errorCorrectionLevel);
            qr.addData('Hi! Its me, Max!');
            qr.make();
            var code = qr.createTableTag(7);
            return {
                body: htmlExporter.getStream(fileSource),
                headers: {
                    'Content-Disposition': 'attachment; filename="' + fileSource.name + '"'
                }
            } 
    }
};