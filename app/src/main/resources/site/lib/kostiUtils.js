var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');

// Takes date in '2014-10-10' string format as an argument
// and returns difference in days between now and passed date.
function getDaysDifference(dateString) {
	if(!dateString && !typeof dateString === 'string' && !dateString instanceof String)
		return null;

	var creationDate = new Date(dateString).getTime(),
			now = new Date().getTime();

	return Math.round((now-creationDate)/24/60/60/1000);
}

//Takes post creation date in '2014-10-10' string format as an argument
//and return string with how much time past since creation date
exports.getTimePassedSincePostCreation = function(postCreationDate){
	var month = ['месяц','месяца','месяцев'],
			day = ['день','дня','дней'],
			year = ['год','года','лет'];

	var daysPassed = getDaysDifference(postCreationDate),
			result = null;

	return daysPassed;

	if(daysPassed === 1)
		return 'меньше дня назад';
	else if(daysPassed > 1 && daysPassed < 31){
		return daysPassed + 'день назад';
	}
	else if(daysPassed >= 31 && daysPassed < 365)
		return Math.round((daysPassed - 1)/30) + ' м назад';

	return null;
}
