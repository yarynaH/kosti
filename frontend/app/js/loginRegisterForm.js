function initLoginRegisterForm(){
	$('.js_header-user .guest-btn').on('click', function(e){
		showLogin(e);
	});
	$(document).on('click', function(event) {
		hideLoginRegisterModal();
	});
	$(document).keyup(function(e) {
		if (e.key === "Escape") {
			hideLoginRegisterModal();
		}
	});
	$('.modal-action-register').on('click', function(e){
		e.preventDefault();
		hideLoginRegisterModal();
		$('.modal-registration').addClass('show');
	});
	$('.modal-action-login').on('click', function(e){
		e.preventDefault();
		hideLoginRegisterModal();
		$('.modal-login').addClass('show');
	});
	$('.modal-action-forgotpass').on('click', function(e){
		e.preventDefault();
		hideLoginRegisterModal();
		$('.modal-forgot-password').addClass('show');
	});
	$('.reset-form .modal-btn-reset').on('click', function(e){
		e.preventDefault();
		var data = {
			email: $('.modal-forgot-password').find("input[name=email]").val(),
			action: 'forgotpass'
		};
		var request = $.ajax({
			url: userServiceUrl,
			method: "POST",
			data: data
		}).done(function(data) {
			console.log(data);
		});
	});
	$('.login-form .modal-btn-login').on('click', function(e){
		e.preventDefault();
		var data = {
			username: $('.modal-login').find("input[name=username]").val(),
			password: $('.modal-login').find("input[name=password]").val(),
			action: 'login'
		};
		var request = $.ajax({
			url: userServiceUrl,
			method: "POST",
			data: data
		}).done(function(data) {
			if( !data.exist && !data.html ){
				$('.modal-login .form-group-error span').text(data.message);
				$('.modal-login .form-group-error').removeClass('hidden');
			} else {
				$('.js_header-user-wrap').html(data.html);
				hideLoginRegisterModal();
				$('.modal-login .form-group-error').addClass('hidden');
			}
		});
	});
	$('.modal-content').on('click', function(e){
		e.stopPropagation();
	});
	$('.register-form .modal-btn-register').on('click', function(e){
		e.preventDefault();
		var data = {
			username: $('.modal-registration').find("input[name=username]").val(),
			password: $('.modal-registration').find("input[name=password]").val(),
			email: $('.modal-registration').find("input[name=email]").val(),
			action: 'register'
		};
		if(!validateEmail(data.email)){
			$('.modal-registration .form-group-error span').text( 'Неправильный емейл' );
			$('.modal-registration .form-group-error').removeClass('hidden');
			return false;
		} else {
			$('.modal-registration .form-group-error').addClass('hidden');
		}
		var request = $.ajax({
			url: userServiceUrl,
			method: "POST",
			data: data
		}).done(function(data) {
			if( data.authenticated ){
				hideLoginRegisterModal();
				$('.modal-registration .form-group-error').addClass('hidden');
				$('.js_header-user-wrap').html(data.html);
			} else if( data.exist ){
				$('.modal-registration .form-group-error span').text(data.message);
				$('.modal-registration .form-group-error').removeClass('hidden');
			}
		});
	});
	$('.resetPassForm').on('submit', function( e ){
		if( $('.resetPassInput').val() != $('.resetPassInputConfirm').val() ){
			e.preventDefault();
			$('.forgotPassValidation').removeClass('hidden');
		}
	});
	function hideLoginRegisterModal(){
		$('body div.modal').each(function(){
			$(this).removeClass('show')
		});
	}
}