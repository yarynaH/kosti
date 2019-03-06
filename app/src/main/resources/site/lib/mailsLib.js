var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var mailLib = require('/lib/xp/mail');

var mailsTemplates = {
	orderCreated: "../pages/mails/orderCreated.html"
};

function sendMail( type, email ){
	var mail = null;
	switch (type){
		case 'orderCreated':
		mail = getorderCreatedMail();
			break;
		default:
			break;
	}
	mailLib.send({
	    from: mail.from,
	    to: email,
	    subject: mail.subject,
	    body: mail.body,
	    contentType: 'text/html; charset="UTF-8"'
	});
}

exports.sendMail = sendMail;

function getorderCreatedMail(){
	return{
		body: thymeleaf.render( resolve(mailsTemplates.orderCreated), {}),
		subject: "Ваш заказ получен",
		from: "sales@kostirpg.com"
	}
}