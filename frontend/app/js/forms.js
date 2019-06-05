function initFormEvents(){
	$('input[type=checkbox]').on('click', function(e){
		var curr = this;
		if( !checkSpace(this) ){
			e.preventDefault();
			$(this).attr("disabled", true);
			return ;
		}
		$(this).parent().parent().find('input[type=checkbox]:checked').each(function(){
			if(this != curr ){
				$(this).prop('checked', false);
			}
		});
	});
	$('main.form input[type=submit]').on('click', function(e){
		var availableSeats = legendary ? 2 : 1;
		if( $('main.form [type=checkbox]:checked').length > availableSeats ){
			e.preventDefault();
			$('form .invalid-qauntity').removeClass('hidden');
		} else {
			$('form .invalid-qauntity').addClass('hidden');
		}
		$('input[type=checkbox]:checked').each(function(){
			if( !checkSpace(this) ){
				$('form .invalid-space').removeClass('hidden');
				e.preventDefault();
			} else {
				$('form .invalid-space').addClass('hidden');
			}
		});
		$('main.form input[type=text]').each(function(){
			if($(this).val() == '' ){
				e.preventDefault();
				$(this).addClass('is-invalid');
				$('form .invalid-input').removeClass('hidden');
			} else {
				$(this).removeClass('is-invalid');
				$('form .invalid-input').addClass('hidden');
			}
		});
	});
	$('input[type=checkbox]').each(function(){
		if( !checkSpace(this)){
			$(this).attr("disabled", true);
		}
	});
}

function checkSpace( el ){
	var data = {
		action: 'checkspace',
		name: $(el).val(),
		game: $(el).attr('name')
	};
	var result;
	$.ajax({
		url: '/_/service/com.myurchenko.kostirpg/form',
		type: 'POST',
		async: false,
		data: data,
		success: function(serverData){
			if( serverData.space >= space[data.game][data.name] ){
				result = false;
			} else {
				result = true;
			}
		}
	});
	return result;
}

$( document ).ready(function() {
	if( $('main.form').length > 0 ){
		initFormEvents();
	}
});