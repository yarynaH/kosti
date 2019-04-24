function initLoginRegisterForm(){
	$('.header-user .guest-btn').on('click', function(e){
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
			if( !data.exist && !data.data ){
			$('.modal-login .form-group-error span').text(data.message);
				$('.modal-login .form-group-error').removeClass('hidden');
			} else {
				$('.header-user').html('<div class="user-avatar-img_wrap">' + 
					'<a href=' + data.url + '><img src="' + data.image.url + 
					'" alt="' + data.displayName + '"></a>');
				hideLoginRegisterModal();
				$('.header-user').attr("data-userid", data.key);
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
			if( data.exist ){
				$('.modal-registration .form-group-error span').text(data.message);
				$('.modal-registration .form-group-error').removeClass('hidden');
			} else {
				hideLoginRegisterModal();
				$('.modal-registration .form-group-error').addClass('hidden');
			}
		});
	});
	function hideLoginRegisterModal(){
		$('body div.modal').each(function(){
			$(this).removeClass('show')
		});
	}
}

function initHeaderClasses(){
	$(document).on('scroll', function(){
		if ( $(document).scrollTop() > 85 ){
			$('.header').addClass('change-logo');

			if ($('body').hasClass('homepage') || $('body').hasClass('article-page') || $('body').hasClass('announce-page')){
				$('.header').addClass('header-scroll');
			} 
		}
		else {
			$('.header').removeClass('header-scroll change-logo');
		}
	});
}


function initCheckoutEvents(){
	$('.checkout-action .checkout-continue').on('click', function(e){
		validateCheckout(e);
	});
	$('form.checkout-form').on('submit', function(e){
		validateCheckout(e);
	});
	$('#phone-checkout-input').on('change paste keyup', function(){
		$('#phone-checkout-input').val($('#phone-checkout-input').val().replace( /\D+/g, ''));
	});
	$('.checkout-form input, .checkout-form select').on('change', function(){
		if( $(this).val() != '' ){
			$(this).parent().removeClass('is-invalid');
		}
	});
}

function initSharedEvents(){
	$('.like-btn').on('click', function(e){
		e.preventDefault();
		if( $('.header-user').data().userid && $('.header-user').data().userid != '' ){
			doUpvote(this);
		} else {
			showLogin(e);
		}
	});

	if ($(window).width() < 768) {
		$('.mobile_menu').on('click', function(){
			$(this).toggleClass('open');
			$('.header').toggleClass('open');
		});
	}

	if( $('form[name=payment]').length > 0 ){
		$('form[name=payment]').submit();
	}
	setCookie(cartId);
	if( $('#payment-success').length > 0 ){
		deleteCookie('cartId');
	}
}

function initCartFunctions(){
	$('.cart-remove_btn').on('click', function(){
		var data = {
			itemId: $(this).data().id,
			size: $(this).data().size,
			amount: 0,
			cartId: $('#ordersAdminCartID').length ? $('#ordersAdminCartID').val() : getCookieValue( 'cartId'),
			action:'modify',
			force: true
		}
		var data = addToCart(data);
		removeItemFromDOM(this);
		function removeItemFromDOM( el ){
			$(el).closest('.cart-item').remove();
		}
	});
}

$( document ).ready(function() {
	initLoginRegisterForm();
	initCheckoutEvents();
	initCartFunctions();
	initSharedEvents();
	initHeaderClasses();
});

function doUpvote(el){
	var data = {
		content: $(el).data('contentid'),
		user: $('.header-user').data('userid')
	};
	var btn = el;
    $.ajax({
        type:'POST',
        url: contentServiceUrl,
        data: data,
        success:function(data){
        	var result = '0';
        	if( data.votes ){
        		result = (Array.isArray(data.votes) ? data.votes.length : '1');
        	}
    		if( parseInt($(btn).text().trim()) < result){
    			$(btn).addClass('active');
    		} else {
    			$(btn).removeClass('active');
    		}
        	$(btn).html('<span>' + result + '</span>');
        },
        error: function(data){
            console.log("error");
            console.log(data);
        }
    });
}

function showLogin(e){
	e.stopPropagation();
	$('body div.modal-login').addClass('show');
}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function addToCart( data ){
	var data = data;
	if( !data ){
		data = {
			action:'modify',
			cartId: getCookieValue( 'cartId'),
			itemId: $('input[name=productId]').val(),
			amount: $('input[name=quantity]').val(),
			size: $('select[name=itemSize]').val()
		};
	}
	var result = false;
	$('.minicart .minicart-qty').removeClass('animate');
	$.ajax({
		url: cartServiceUrl,
		type: 'POST',
		data: data,
		success: function(data){
			setCookie(data._id);
			$('.minicart .minicart-total').html('UAH ' + data.price.items);
			$('.minicart .minicart-qty').text(parseInt(data.itemsNum) > 99 ? "9+" : data.itemsNum);
			$('.cart-total .value .cart-items-price').text(data.price.items);
			result = data;
			$('.minicart .minicart-qty').addClass('animate');
		}
	});
	return result;
}

function validateEmail(email) {
    var re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone).toLowerCase());
}

function setCookie( cartId ){
	document.cookie = "cartId=" + cartId + "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

function deleteCookie( name ) {
  document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function validateCheckout(e){
	$('form.checkout-form input, form.checkout-form select').each(function(){
		if( $(this).val() == null || $(this).val() == '' ){
			e.preventDefault();
			$(this).parent().addClass('is-invalid');
		}
	});
	var tel = $('#phone-checkout-input').val();
	if( tel && !validatePhone(tel)){
		e.preventDefault();
		$('#phone-checkout-input').parent().addClass('is-invalid');
	}
	var email = $('#email-checkout-input').val();
	if( email && !validateEmail(email)){
		e.preventDefault();
		$('#email-checkout-input').parent().addClass('is-invalid');
	}
	if( $('#agreement').length && !$('#agreement').is(":checked") ){
		e.preventDefault();
		$('#agreement').parent().addClass('is-invalid');
	}
}
