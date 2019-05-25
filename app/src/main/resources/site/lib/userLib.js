var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var hashLib = require('hashLib');
var mailsLib = require('mailsLib');
var authLib = require('/lib/xp/auth');
var contextLib = require('/lib/contextLib');
var common = require('/lib/xp/common');
var i18nLib = require('/lib/xp/i18n');

exports.findUser = findUser;
exports.activateUser = activateUser;
exports.getCurrentUser = getCurrentUser;
exports.addBookmark = addBookmark;
exports.checkIfBookmarked = checkIfBookmarked;
exports.getUserDataById = getUserDataById;

function getCurrentUser(){
	var user = authLib.getUser();
	var userObj = false;
	if( user && user.email && user.displayName ){
		userObj = contentLib.query({
			query: "data.email = '" + user.email + "' AND displayName = '" + user.displayName + "'",
			contentTypes: [
				app.name + ":user"
			]
		});
		if( userObj.hits && userObj.hits[0] ){
			userObj = userObj.hits[0];
			userObj.url = portal.pageUrl({ id: userObj._id });
			userObj.image = norseUtils.getImage( userObj.data.userImage, 'block(32,32)', 1 );
			userObj.key = user.key;
		} else {
			userObj = false;
		}
	}
	return userObj;
}

exports.getSystemUser = function( name ){
	var user = false;
	contextLib.runAsAdmin(function () {
		user = findUser(name);
	});
	return user;
}

function getUserDataById( id ){
	var user = getCurrentUser();
	return {
		displayName: user.displayName,
		url: user.url,
		image: user.image,
		key: user.key
	};
}

exports.register = function( name, mail, pass ){
    var site = portal.getSite();
    var exist = checkUserExists( name, mail );
    if( exist.exist ){
    	exist.message = i18nLib.localize({
		    key: 'global.user.' + exist.type + 'Exists',
		    locale: "ru"
		});
    	return exist;
    }
	var user = authLib.createUser({
	    userStore: 'system',
	    name: common.sanitize(name),
	    displayName: name,
	    email: mail
	});
	authLib.changePassword({
	    userKey: user.key,
	    password: pass
	});
	var userObj = this.createUserContentType( name, mail, user.key );
	var activationHash = hashLib.saveHashForUser( mail, "registerHash" );
	var sent = mailsLib.sendMail( "userActivation", mail, { activationHash: activationHash } );
	if( userObj ){
		return this.login( name, pass );
	} else {
		return false;
	}
}

exports.createUserContentType = function( name, mail, userkey ){
    var site = portal.getSiteConfig();
    var usersLocation = contentLib.get({ key: site.userLocation });
	var user = contentLib.create({
		parentPath: usersLocation._path,
		name: common.sanitize(name),
		displayName: name,
		branch: 'draft',
    	contentType: app.name + ':user',
    	language: 'ru',
    	data: {
    		email: mail
    	}
	});
	contentLib.setPermissions({
	    key: user._id,
    	inheritPermissions: false,
    	overwriteChildPermissions: true,
	    branch: "draft",
	    permissions: [{
	        principal: userkey,
	        allow: ['READ','MODIFY','PUBLISH', 'CREATE'],
            deny: ['DELETE']
	    },
        {
            principal: 'role:system.everyone',
            allow: ['READ'],
            deny: []
        }]
	});

	var result = contentLib.publish({
	    keys: [user._id],
	    sourceBranch: 'draft',
	    targetBranch: 'master'
	});
	return result;
}

exports.login = function( name, pass ){
	var user = false;
	contextLib.runAsAdmin(function () {
		user = findUser(name);
	});
	if( !user ){
		return {
			exist: false,
			message: i18nLib.localize({
			    key: 'global.user.userNotExists',
			    locale: "ru"
			})
		};
	}
	var loginResult = authLib.login({
	    user: user.login,
	    password: pass,
	    userStore: 'system'
	});
	if( loginResult.authenticated == true ){
		return this.getCurrentUser();
	} else {
		return {
			exist: false,
			message: i18nLib.localize({
			    key: 'global.user.incorrectPass',
			    locale: "ru"
			})
		}
	}
}

function addBookmark( contentId ) {
	var user = getCurrentUser();
    user = contentLib.modify({
        key: user._id,
        editor: userEditor,
        branch: 'draft'
    });
    var publishResult = contentLib.publish({
        keys: [user._id],
        sourceBranch: 'draft',
        targetBranch: 'master'
    });
	function userEditor(user){
		var temp = norseUtils.forceArray(user.data.bookmarks);
		if( !temp ){
			temp = [];
		}
		if( temp.indexOf(contentId) == -1 ){
		    temp.push(contentId);
		} else {
			temp.splice(temp.indexOf(contentId), 1);
		}
	    user.data.bookmarks = temp;
	    return user;
	}
	return checkIfBookmarked(contentId);
}

function checkIfBookmarked( contentId ){
	var user = getCurrentUser();
	if( user && user.data && user.data.bookmarks && user.data.bookmarks.indexOf(contentId) != -1 ){
		return true;
	}
	return false;
}

function findUser( name ){
	var user = authLib.findUsers({
	    start: 0,
	    count: 1,
	    query: 'email="' + name + '" OR login="' + name + '"'
	});
	if( user && user.hits && user.hits[0] ){
		return user.hits[0];
	}
	return false;
}

exports.logout = function(){
	return authLib.logout();
}

function forgotPass( email, hash ){
	var user = contextLib.runAsAdmin(function () {
		return hashLib.getUserByHash( email, hash, 'resetPassHash' );
    });
	if( user && user !== true ){
		return user.key;
	}
	return false;
}

exports.forgotPass = forgotPass;

function setNewPass( password, email, hash ){
	return contextLib.runAsAdmin(function () {
		var user = forgotPass(email, hash);
		if( user ){
			authLib.changePassword({
			    userKey: user,
			    password: password
			});
			hashLib.activateUserHash( email, hash, 'resetPassHash' );
			return true;
		}
		return false;
    });
}

exports.setNewPass = setNewPass;

function resetPass( email ){
	if( !email || email == '' ){
		return { 
			status: 404,
			message: 'Пользователь не найден.'
		};
	}
	var userExist = contextLib.runAsAdmin(function () {
		return checkUserExists( false, email ).exist
    });
    if( !userExist ){
		return { 
			status: 404,
			message: 'Пользователь не найден.'
		};
    }
    var hash = contextLib.runAsAdmin(function () {
		return hashLib.saveHashForUser( email, 'resetPassHash' );
    });
    mailsLib.sendMail( 'forgotPass', email, {forgotPassHash: hash} );
	return { 
		status: 200,
		message: 'Инструкции отправленны вам на почту.'
	};
}

exports.resetPass = resetPass;

function activateUser( mail, hash ){
    return contextLib.runAsAdmin(function () {
		return hashLib.activateUserHash( mail, hash, 'registerHash' );
    });
}

exports.uploadUserImage = function(){
    var stream = portal.getMultipartStream('userImage');
    var imageMetadata = portal.getMultipartItem('userImage');
    var user = this.getCurrentUser();
    var image = contentLib.createMedia({
        name: imageMetadata.fileName,
        parentPath: user._path,
        mimeType: imageMetadata.contentType,
        branch: 'draft',
        data: stream
    });
    user = contentLib.modify({
        key: user._id,
        editor: userImageEditor,
        branch: 'draft'
    });
    var publishResult = contentLib.publish({
        keys: [image._id, user._id],
        sourceBranch: 'draft',
        targetBranch: 'master'
    });
	function userImageEditor(user){
	    user.data.userImage = image._id;
	    return user;
	}
    return norseUtils.getImage( user.data.userImage, 'block(32,32)' );
}

function checkUserExists( name, mail ){
	var user = false;
	if( name ){
		user = authLib.findUsers({
			start: 0,
			count: 1,
			query: 'login="' + name + '"'
		});
		if( user.total > 0 ){
			return {
				exist: true,
				type: 'name'
			}
		}
	}
	if( mail ){
		user = authLib.findUsers({
			start: 0,
			count: 1,
			query: 'email="' + mail + '"'
		});
		if( user.total > 0 ){
			return {
				exist: true,
				type: 'mail'
			}
		}
	}
	return {
		exist: false
	}
}

function sendConfirmationMail( mail ){
	var hash = hashLib.saveHashForUser( mail, "registerHash" );
}