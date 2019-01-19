var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var thymeleaf = require('/lib/xp/thymeleaf');
var norseUtils = require('norseUtils');
var authLib = require('/lib/xp/auth');
var nodeLib = require('/lib/xp/node');
var libs = {
    content: require('/lib/xp/content'),
    context: require('/lib/xp/context')
};

exports.getCurrentUser = function(){
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
	    userObj.image = norseUtils.getImage( userObj.data.userImage, 'block(32,32)' );
	  } else {
	    userObj = false;
	  }
	}
	return userObj;
}