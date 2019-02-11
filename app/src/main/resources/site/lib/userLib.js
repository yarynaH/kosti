var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var contextLib = require('/lib/contextLib');
var common = require('/lib/xp/common');

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
			userObj.key = user.key;
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
	    name: common.sanitize(name),
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
		name: common.sanitize(name),
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
	var user = false;
	contextLib.runAsAdmin(function () {
		user = findUser(name);
	});
	if( !user || !user.hits || !user.hits[0] ){
		return false;
	}
	var loginResult = authLib.login({
	    user: user.hits[0].login,
	    password: pass,
	    userStore: 'system'
	});
	if( loginResult.authenticated == true ){
		return this.getCurrentUser();
	}

	function findUser( name ){
		return authLib.findUsers({
		    start: 0,
		    count: 1,
		    query: 'email="' + name + '" OR login="' + name + '"'
		});
	}
}

exports.uploadUserImage = function(){
    var stream = portal.getMultipartStream('userImage');
    var imageMetadata = portal.getMultipartItem('userImage');
    var result = null;
    var site = portal.getSiteConfig();
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
        editor: userImageEditor
    });
    var publishResult = contentLib.publish({
        keys: [image._id, user._id],
        sourceBranch: 'draft',
        targetBranch: 'master'
    });
    return norseUtils.getImage( user.data.userImage, 'block(32,32)' );

    function userImageEditor(user){
        user.data.userImage = image._id;
        return user;
    }
}