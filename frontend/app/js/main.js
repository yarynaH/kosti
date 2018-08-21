function checkParams(){
	var totalCitizens = 0;
	$('#generateCityForm').find($('.citizens')).each( function( ) {
		if(!isNaN(parseInt($(this).val()))){
			totalCitizens += parseInt($(this).val());
		}
	});
	var canSubmit = false;
	if( !$('.generateCityName').val() || $('.generateCityName').val() == '' ){
		canSubmit = true;
	}
	console.log($('.generateCityName').val());
	if( (100 - totalCitizens == 0) || (100 - totalCitizens == 100) ){
		$('.scoreLeftBlock').text('');
	}
	else{
		$('.scoreLeftBlock').text('Score left: ' + (100 - totalCitizens));
		canSubmit = true;
	}
	$('.generateCitySubmit').prop('disabled', canSubmit);
}

$( document ).ready(function() {
	if($('#generateCityForm')[0]){
		$('#generateCityForm').change( function(){ checkParams() });
	}
});