var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');

//Takes post creation date in '2014-10-10' string format as an argument
//and return string with how much time past since creation date
exports.getTimePassedSincePostCreation = function(postCreationDate){
	if(!postCreationDate || (!typeof postCreationDate === 'string' && !postCreationDate instanceof String))
		return null;

	var daysPassed = getDaysDifference(postCreationDate);

	if(daysPassed === 0){
		var hoursPassed = getHoursDifference(postCreationDate);
		if(hoursPassed === 0){
			var minutesPassed = getMinutesDifference(postCreationDate);
			if(minutesPassed === 0)
				return 'меньше минуты назад';
			else if(minutesPassed >= 1 && minutesPassed < 60)
				return minutesPassed + ' ' + getCyrilicMinute(minutesPassed) + ' назад'; 
		}
		else if(hoursPassed >= 1 && hoursPassed < 24)
			return hoursPassed + ' ' + getCyrilicHour(hoursPassed) + ' назад';
	}
	else if(daysPassed >= 1 && daysPassed < 31)
		return daysPassed + ' ' + getCyrilicDay(daysPassed) + ' назад';
	else if(daysPassed >= 31 && daysPassed < 366){
		var m = Math.floor((daysPassed - 1)/30.4166);
		return m + ' ' + getCyrilicMonth(m) + ' назад';
	}
	else if(daysPassed >= 366){
		var y = Math.floor((daysPassed - 1)/365.25);
		return y + ' ' + getCyrilicYear(y) + ' назад';
	}

	return null;
}

//Takes Number of minutes
// and return cyrilic "minute/minutes" word with correct ending
function getCyrilicMinute(minutesNum){
	if(isNaN(minutesNum))
		return null;

	var minute = ['минуту', 'минуты', 'минут'];
	if(minutesNum % 10 === 1 && minutesNum % 1000 != 11)
		return minute[0];
	else if((minutesNum % 10 === 2 && minutesNum % 1000 != 12)
		 || (minutesNum % 10 === 3 && minutesNum % 1000 != 13)
	  	 || (minutesNum % 10 === 4 && minutesNum % 1000 != 14))
		return minute[1];
	else
		return minute[2];
}

//Takes Number of hours
// and return cyrilic "hour/hours" word with correct ending
function getCyrilicHour(hoursNum){
	if(isNaN(hoursNum))
		return null;

	var hour = ['час', 'часа', 'часов'];
	if(hoursNum % 10 === 1 && hoursNum % 1000 != 11)
		return hour[0];
	else if((hoursNum % 10 === 2 && hoursNum % 1000 != 12)
		 || (hoursNum % 10 === 3 && hoursNum % 1000 != 13)
	  	 || (hoursNum % 10 === 4 && hoursNum % 1000 != 14))
		return hour[1];
	else
		return hour[2];
}

//Takes Number of days
// and return cyrilic "day/days" word with correct ending
function getCyrilicDay(daysNum){
	if(isNaN(daysNum))
		return null;

	var day = ['день','дня','дней'];
	if(daysNum % 10 === 1 && daysNum % 1000 != 11)
		return day[0];
	else if((daysNum % 10 === 2 && daysNum % 1000 != 12)
		 || (daysNum % 10 === 3 && daysNum % 1000 != 13)
	  	 || (daysNum % 10 === 4 && daysNum % 1000 != 14))
		return day[1];
	else
		return day[2];
}

//Takes Number of month
// and return cyrilic "month/months" word with correct ending
function getCyrilicMonth(monthNum){
	if(isNaN(monthNum))
		return null;

	var month = ['месяц','месяца','месяцев'];

	if(monthNum % 10 === 1 && monthNum % 1000 != 11)
		return month[0];
	else if((monthNum % 10 === 2 && monthNum % 1000 != 12)
		 || (monthNum % 10 === 3 && monthNum % 1000 != 13)
		 || (monthNum % 10 === 4 && monthNum % 1000 != 14))
		return month[1];
	else
		return month[2];
}

//Takes Number of years
// and return cyrilic "year/years" word with correct ending
function getCyrilicYear(yearNum){
	if(isNaN(yearNum))
		return null;

	var year = ['год','года','лет'];

	if(yearNum % 10 === 1 && yearNum % 1000 != 11)
		return year[0];
	else if((yearNum % 10 === 2 && yearNum % 1000 != 12)
		 || (yearNum % 10 === 3 && yearNum % 1000 != 13)
		 || (yearNum % 10 === 4 && yearNum % 1000 != 14))
		return year[1];
	else
		return year[2];
}

// Takes date in '2014-10-10' string format as an argument
// and returns difference in days between now and passed date.
function getDaysDifference(dateString) {
	if(!dateString || (!typeof dateString === 'string' && !dateString instanceof String))
		return null;

	var creationDate = new Date(dateString).getTime(),
			now = new Date().getTime();

	return Math.round((now-creationDate)/24/60/60/1000);
}

// Takes date in '2014-10-10' string format as an argument
// and returns difference in hours between now and passed date.
function getHoursDifference(dateString) {
	if(!dateString || (!typeof dateString === 'string' && !dateString instanceof String))
		return null;

	var creationDate = new Date(dateString).getTime(),
			now = new Date().getTime();

	return Math.round((now-creationDate)/60/60/1000);
}

// Takes date in '2014-10-10' string format as an argument
// and returns difference in minutes between now and passed date.
function getMinutesDifference(dateString) {
	if(!dateString || (!typeof dateString === 'string' && !dateString instanceof String))
		return null;

	var creationDate = new Date(dateString).getTime(),
			now = new Date().getTime();

	return Math.round((now-creationDate)/60/1000);
}