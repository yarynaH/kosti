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
var htmlExporter = require('/lib/openxp/html-exporter');
var textEncodingLib = require('/lib/text-encoding');

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
                body: getStream(htmlExporter.exportToPdf(thymeleaf.render(resolve("../../pages/pdfs/ticket.html"), {qrcode: code}))),
                headers: {
                    'Content-Disposition': 'attachment; filename="test.pdf"'
                }
            }
    }

    function getStream( fileSource, charsetDecode, encoding ){
        var stream = textEncodingLib.base64Decode( fileSource.content );

        if( encoding == undefined ){
            encoding = "UTF-8";
        }

        if(charsetDecode != undefined && charsetDecode === true){
            stream = textEncodingLib.charsetDecode(stream, encoding);
        }

        return stream;
    }
};