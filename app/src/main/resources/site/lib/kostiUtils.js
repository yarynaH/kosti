var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');

// Takes date in '2014-10-10' string format as an argument
// and returns difference in days between now and passed date.
exports.getDaysDifference = function(dateString) {
	if(!dateString && !typeof dateString === 'string' && !dateString instanceof String)
		return null;

	var creationDate = new Date(dateString).getTime(),
			now = new Date().getTime();

	return Math.round((now-creationDate)/24/60/60/1000);
}

// this.getDaysDifference();
