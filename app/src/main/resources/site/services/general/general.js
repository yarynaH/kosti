var norseUtils = require('norseUtils');
var contentLib = require('/lib/xp/content');
var helpers = require('helpers');

exports.get = function(req){
	var params = req.params;
	switch(params.action){
		case 'fixPermissions':
            helpers.fixPermissions( params.repo );
			break;
	}
    return {
        body: "",
        contentType: 'text/html'
    }
}