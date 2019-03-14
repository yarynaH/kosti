var authLib = require('/lib/xp/auth');
var textEncoding = require('/lib/text-encoding');
var norseUtils = require('norseUtils');

function generateHash( name ){
	var salt = "KostiCon-2019";
	return textEncoding.md5( salt + name + (new Date().getTime()) );
}

function saveHashForUser( email, hashType ){
	var hash = generateHash(email);
	var user = findUser(email);
    var profile = authLib.modifyProfile({
    	key: user.key,
        scope: app.name,
    	editor: editor
    });

    return profile[hashType];

    function editor(c) {
        if (!c) {
            c = {};
        }
        c[hashType] = hash;
        return c;
    }
}

exports.saveHashForUser = saveHashForUser;

function getUserByHash( mail, hash, hashType ) {
	var result = null;	
	var user = findUser( mail );
	if ( !user ) {
		return false;
	}
	var userProfile = authLib.getProfile({
        key: user.key,
        scope: app.name
    });
    if ( !userProfile || ( userProfile && !userProfile[hashType]) || 
    	 ( userProfile && userProfile[hashType] && userProfile[hashType] !== hash) ) {
    	return false;
    }
    return true;
}

exports.getUserByHash = getUserByHash;

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