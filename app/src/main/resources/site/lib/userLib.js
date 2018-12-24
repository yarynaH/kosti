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

exports.getCurrUser = function(){
	var user = authLib.getUser();
	var usersRepo = this.getUserRepo();
	if( user && user.email ){
		var user = usersRepo.query({
			start: 0,
			count: 1,
			query: "email = '" + user.email + "'",
		}).hits[0].id;
		return usersRepo.get(user);
	}
	return false;
}

exports.getUserRepo = function(){
    return nodeLib.connect({
        repoId: 'users',
        branch: 'master',
        principals: ["role:system.admin"]
    });
}