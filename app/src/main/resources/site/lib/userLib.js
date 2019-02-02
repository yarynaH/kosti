var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var contextLib = require('/lib/contextLib');

exports.getCurrentUser = function(){
	var user = authLib.getUser();
	var userObj = false;
	if( user && user.email && user.displayName ){
		contextLib.runAsAdmin(function () {
			userObj = contentLib.query({
				query: "data.email = '" + user.email + "' AND displayName = '" + user.displayName + "'",
				contentTypes: [
					app.name + ":user"
				]
			});
		});
		if( userObj.hits && userObj.hits[0] ){
			userObj = userObj.hits[0];
			userObj.image = norseUtils.getImage( userObj.data.userImage, 'block(32,32)' );
		} else {
			userObj = false;
		}
	}
	return userObj;
}

exports.register = function( name, mail, pass ){
    var site = portal.getSite();
	var user = authLib.createUser({
	    userStore: 'system',
	    name: name,
	    displayName: name,
	    email: mail
	});
	authLib.changePassword({
	    userKey: user.key,
	    password: pass
	});
	var userObj = this.createUserContentType( name, mail );
	if( userObj ){
		return this.login( name, pass );
	} else {
		return false;
	}
}

exports.createUserContentType = function( name, mail ){
    var site = portal.getSiteConfig();
    var usersLocation = contentLib.get({ key: site.userLocation });
	var user = contentLib.create({
		parentPath: usersLocation._path,
		name: encodeURI(name),
		displayName: name,
		branch: 'draft',
    	contentType: app.name + ':user',
    	language: 'ru',
    	data: {
    		email: mail
    	}
	});
	var result = contentLib.publish({
	    keys: [user._id],
	    sourceBranch: 'draft',
	    targetBranch: 'master'
	});
	return result;
}

exports.login = function( name, pass ){
	var loginResult = authLib.login({
	    user: name,
	    password: pass,
	    userStore: 'system'
	});
	if( loginResult.authenticated == true ){
		return this.getCurrentUser();
	}
}