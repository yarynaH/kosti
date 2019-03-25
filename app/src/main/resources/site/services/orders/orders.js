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
var hashLib = require('hashLib');
var htmlExporter = require('/lib/openxp/html-exporter');
var textEncodingLib = require('/lib/text-encoding');
var mailsLib = require('mailsLib');

var surveyEmails = ["anno172069@gmail.com", "vovikys1997@gmail.com", "lind@te.net.ua", "ozy.ru@mail.ru", "popovnv94@gmail.com", "balanarishche@gmail.com", "Prozorovskiy1998@gmail.com", "Toschiki@yandex.ru", "natalisbessa@gmail.com", "eugen.yanovich@gmail.com", "ludmilakarneeva@gmail.com", "santexnik1995@gmail.com", "rokzomb@gmail.com", "joker__rus@mail.ru", "pv3153@i.ua", "zavgar1308@gmail.com", "108vat@gmail.com", "darth.dakar@gmail.com", "vova.converse17@gmail.com", "Himinst@outlook.com", "Blind.KAKTyC@gmail.com", "kuzub.mitya@gmail.com", "glushchenko.tim@gmail.com", "6462602@gmail.com", "6462602@gmail.com ", "a.v.palikhov@hotmail.com", "r.sid.satar@gmail.com", "knidarkness@gmail.com", "w260698@gmail.com", "vaprocenko@gmail.com", "danya14376@gmail.com", "art.butakov@gmail.com", "nix.nameless@gmail.com", "leibyuk04mi@gmail.com", "ksusamik@mail.ru", "kolyunjash@gmail.com", "eugen.goutnick@gmail.com", "Yolich.Michael@gmail.com", "againyesterday@gmail.com", "lesnoy_kot@mail.ru", "v.pastushuk@gmail.com", "elvispolemon@gmail.com", "Netnuahule@gmail.com", "tanikvetil.k@gmail.com", "marianfedkovich@gmail.com", "attila.stankovich@gmail.com", "dankopaladin@gmail.com", "zoltankeniz@gmail.com", "chubvadym@gmail.com", "dma-prudivus@rambler.ru", "kuropyatnikd@gmail.com", "Z4p1zd0z@gmail.com", "fedorov_ds@mail.ru", "m.mercer@gmail.com", "olesolo.games@gmail.com", "danya14376@gmail.com ", "katrich.andrey@ukr.net", "slavkoslayw@gmail.com", "virtuemonkey@gmail.com", "ua.aurum@gmail.com", "Mhobotnyaev@mail.ru", "Deyzyk@gmail.com ", "filosolofufus@gmail.com", "daimon4@meta.ua", "k.donets@gmail.vom", "gray25cat@gmail.com", "dma.prudivus@gmail.com ", "antonvn@ukr.net", "9129932166@mail.ru", "Lokhed619@gmail.com"];

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
            var code = qr.createTableTag(7,0);
            return {
                body: thymeleaf.render(resolve("../../pages/pdfs/regularTicket.html"), {qrcode: code}),
                contentType: 'text/html'
            }
        case 'pdfPageFile':
            var typeNumber = 4;
            var errorCorrectionLevel = 'L';
            var qr = qrLib(typeNumber, errorCorrectionLevel);
            qr.addData('Hi! Its me, Max!');
            qr.make();
            var code = qr.createTableTag(7,0);
            return {
                body: getStream(htmlExporter.exportToPdf(thymeleaf.render(resolve("../../pages/pdfs/regularTicket.html"), {qrcode: code}))),
                headers: {
                    'Content-Disposition': 'attachment; filename="test.pdf"'
                }
            }
        case 'checkSubscription':
            mailsLib.prepareNewsletter();
            break;
        case 'importUsersToNode':
            var site = portal.getSiteConfig();
            var emails = contentLib.get({ key: site.mailsLocation });
            emails = emails.data.mail;
            var newsletterRepo = nodeLib.connect({
                repoId: 'newsletter',
                branch: "master"
            });
            for( var i = 0; i < emails.length; i++ ){
                var created = newsletterRepo.query({
                    start: 0,
                    count: 1,
                    query: "email = '" + emails[i] + "'",
                });
                if( created.total > 0 ){
                    continue;
                }
                newsletterRepo.create({
                    email: emails[i],
                    subscriptionHash: hashLib.generateHash(emails[i])
                });
            }
            for( var i = 0; i < surveyEmails.length; i++ ){
                var created = newsletterRepo.query({
                    start: 0,
                    count: 1,
                    query: "email = '" + surveyEmails[i] + "'",
                });
                if( created.total > 0 ){
                    continue;
                }
                newsletterRepo.create({
                    email: surveyEmails[i],
                    subscriptionHash: hashLib.generateHash(surveyEmails[i])
                });
            }
            break;
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