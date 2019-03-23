var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var mailLib = require('/lib/xp/mail');
var htmlExporter = require('/lib/openxp/html-exporter');
var ioLib = require("/lib/xp/io");
var qrLib = require('qrLib');

var mailsTemplates = {
	orderCreated: "../pages/mails/orderCreated.html",
	userActivation: "../pages/mails/userActivation.html",
	ticket: "../pages/pdfs/ticket.html"
};

function sendMail( type, email, params ){
	var mail = null;
	switch (type){
		case 'orderCreated':
			mail = getorderCreatedMail( params );
			break;
		case 'userActivation':
			mail = getActivationMail( email, params );
			break;
		default:
			break;
	}
	var sent = mailLib.send({
	    from: mail.from,
	    to: email,
	    subject: mail.subject,
	    body: mail.body,
	    contentType: 'text/html; charset="UTF-8"',
	    attachments: mail.attachments
	});
}

function getorderCreatedMail( params ){
	return{
		body: thymeleaf.render( resolve(mailsTemplates.orderCreated), {
			order: params.order,
    		site: portal.getSite(),
			cart: params.cart
		}),
		subject: "Ваш заказ получен",
		from: "noreply@kostirpg.com", 
		attachments: getTickets(params)
	}

	function getTickets( params ){
		var qrs = [];
	    var typeNumber = 4;
	    var errorCorrectionLevel = 'L';
	    var qr = qrLib(typeNumber, errorCorrectionLevel);
		for( var i = 0; i < params.cart.items.length; i ++ ){
			var item = contentLib.get({ key: params.cart.items[i]._id });
			if( item && item.data && item.data.digital ){
				for( var j = 0; j < params.cart.items[i].itemsIds.length; j++ ){
			        qr.addData('Hi! Its me, Max!');
			        qr.make();
			        qrs.push(qr.createTableTag(7));
				}
			}
		}
		var pdfs = [];
		for( var i = 0; i < qrs.length; i++ ){
			var fileSource = htmlExporter.exportToPdf(thymeleaf.render(resolve(mailsTemplates.ticket), {qrcode: qrs[i]}));
			fileSource.name = 'ticket' + i + '.pdf';
			var stream = htmlExporter.getStream(fileSource);
			var tempData = {
				data: stream,
	            mimeType: 'application/pdf',
	            headers: {
	                'Content-Disposition': 'attachment; filename="' + fileSource.name + '"'
	            },
				fileName: fileSource.name
			}
			pdfs.push(tempData);
		}
		return pdfs;
	}
}

function getActivationMail( mail, params ){
	var activationUrl = portal.serviceUrl({
	    service: 'user',
	    type: 'absolute',
	    params: {
	        mail: encodeURI(mail),
	        action: "confirmRegister",
	        hash: params.activationHash
	    }
	});
	return{
		body: thymeleaf.render( resolve(mailsTemplates.userActivation), {
			activationUrl: activationUrl,
		}),
		subject: "Активация аккаунта",
		from: "noreply@kostirpg.com"
	}
}

exports.sendMail = sendMail;