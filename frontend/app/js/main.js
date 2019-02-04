function initLoginRegisterForm(){
	$('.header-user .guest-btn').on('click', function(e){
		e.stopPropagation();
		$('body div.modal-login').addClass('show');
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

function initPDPFunctions(){
	$('.qty-decrement').on('click', function(){
		$('.qty-input').val(Math.max(parseInt($('.qty-input').val()) - 1, 1));
	});
	$('.qty-increment').on('click', function(){
		$('.qty-input').val(parseInt($('.qty-input').val()) + 1, 1);
	});
	$('.pdp-image-item img').on('click', function(e){
		e.preventDefault();
		var prevImg = $('.pdp-main_image').find('img').attr('src');
		$('.pdp-main_image').find('img').attr('src', $(this).attr('src'));
		$('.pdp-main_image').zoom({url: $(this).attr('src')});
		$(this).attr('src', prevImg);
	});
	$('.add_to_cart-btn').on('click', function(e){
		if(!$('#pdp-size-select').val()){
			e.preventDefault();
			$('.pdp-validation').removeClass('visually-hidden');
		} else {
			$('.pdp-validation').addClass('visually-hidden');
		}
	});
	$('.pdp-main_image').zoom({url: pdpImageUrl});
}

$( document ).ready(function() {
	initLoginRegisterForm();
	initHomepageSlider();
	initPDPFunctions();
});