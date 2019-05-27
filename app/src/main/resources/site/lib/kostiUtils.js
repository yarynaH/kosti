var contentLib = require('/lib/xp/content');
var portal = require('/lib/xp/portal');
var norseUtils = require('norseUtils');

//Takes post creation date in '2014-10-10' string format as an argument
//and return string with how much time past since creation date
exports.getTimePassedSincePostCreation = function(postCreationDate){
	if(!postCreationDate || (!typeof postCreationDate === 'string' && !postCreationDate instanceof String))
		return null;

	var minutesPassed = getMinutesDifference(postCreationDate);
	if(minutesPassed === 0)
		return 'меньше минуты назад';
	else if(minutesPassed >= 1 && minutesPassed < 60)
		return minutesPassed + ' ' + getCyrilicMinute(minutesPassed) + ' назад';
	else{
		var hoursPassed = Math.round(minutesPassed/60)
		if(hoursPassed >= 1 && hoursPassed < 24)
			return hoursPassed + ' ' + getCyrilicHour(hoursPassed) + ' назад';
		else{
	    	var daysPassed = Math.round(hoursPassed/24);
	    	if(daysPassed >= 1 && daysPassed < 31)
				return daysPassed + ' ' + getCyrilicDay(daysPassed) + ' назад';
			else if(daysPassed >= 31 && daysPassed < 365){
				var month = Math.floor(daysPassed/31);
				return month + ' ' + getCyrilicMonth(month) + ' назад';
			}
			else if(daysPassed >= 365){
				var year = Math.round(daysPassed/365);
				return year + ' ' + getCyrilicYear(year) + ' назад';
			}
		}	
	}

	return null;
}

//Takes Number of minutes
// and return cyrilic "minute/minutes" word with correct ending
function getCyrilicMinute(minutesNum){
	if(isNaN(minutesNum))
		return null;

	var minute = ['минуту', 'минуты', 'минут'];
	var num = getWordNumber(minutesNum);
	return minute[num];
}

//Takes Number of hours
// and return cyrilic "hour/hours" word with correct ending
function getCyrilicHour(hoursNum){
	if(isNaN(hoursNum))
		return null;

	var hour = ['час', 'часа', 'часов'];
	var num = getWordNumber(hoursNum);
	return hour[num];
}

//Takes Number of days
// and return cyrilic "day/days" word with correct ending
function getCyrilicDay(daysNum){
	if(isNaN(daysNum))
		return null;

	var day = ['день','дня','дней'];
	var num = getWordNumber(daysNum);
	return day[num];
}

//Takes Number of month
// and return cyrilic "month/months" word with correct ending
function getCyrilicMonth(monthNum){
	if(isNaN(monthNum))
		return null;

	var month = ['месяц','месяца','месяцев'];
	var num = getWordNumber(monthNum);
	return month[num];
}

//Takes Number of years
// and return cyrilic "year/years" word with correct ending
function getCyrilicYear(yearNum){
	if(isNaN(yearNum))
		return null;

	var year = ['год','года','лет'];
	var num = getWordNumber(yearNum);
	return year[num];
}

//Take a number and return number of correct word from vector
function getWordNumber(num){
	//for numbers that end with '1' but not 11
	if(num % 10 === 1 && num % 1000 != 11)
		return 0;
	//for numbers that end with '2', '3', '4' but not '12', '13', '14'
	else if((num % 10 === 2 && num % 1000 != 12)
		 || (num % 10 === 3 && num % 1000 != 13)
		 || (num % 10 === 4 && num % 1000 != 14))
		return 1;
	//for rest numbers
	else
		return 2;
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