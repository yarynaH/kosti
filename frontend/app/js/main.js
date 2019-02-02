function initLoginRegisterForm(){
	$('.header-user .guest-btn').on('click', function(){
		$('body div.modal-login').addClass('show');
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
			$('.header-user').html('<div class="user-avatar-img_wrap">' + 
				'<img src="' + data.image.url + '" alt="' + data.displayName + '"></div>');
			hideLoginRegisterModal();
		});
	});
	$('.register-form .modal-btn-register').on('click', function(e){
		e.preventDefault();
		var data = {
			username: $('.modal-registration').find("input[name=username]").val(),
			password: $('.modal-registration').find("input[name=password]").val(),
			email: $('.modal-registration').find("input[name=email]").val(),
			action: 'register'
		};
		var request = $.ajax({
			url: userServiceUrl,
			method: "POST",
			data: data
		}).done(function(data) {
			hideLoginRegisterModal();
		});
	});
	function hideLoginRegisterModal(){
		$('body div.modal').each(function(){
			$(this).removeClass('show')
		});
	}
}

function initHomepageSlider(){
	$('.homepage_slider').slick({
		dots: true,
		arrows: false
	});
}

$( document ).ready(function() {
	initLoginRegisterForm();
	initHomepageSlider();
});