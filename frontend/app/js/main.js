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

function initHomepageSlider(){
	$('.homepage_slider').slick({
		dots: true,
		arrows: false,
		autoplay: true
	});
}

function initHomepageFunction(){
	$(document).on('scroll', function(){
		if( $(document).scrollTop() > 85 ){
			$('.homepage header').addClass('header-scroll');
		} else {
			$('.homepage header').removeClass('header-scroll');
		}
	});
}

function initPDPFunctions(){
	$('.qty-decrement').on('click', function(){
		var input = $('.qty-input[data-id=' + $(this).data().id + '][data-size=' + $(this).data().size + ']');
		input.val(Math.max(parseInt(input.val()) - 1, 1));
		if( $('.cart-list').length > 0 ){
			addToCartOnclick( input );
		}
	});
	$('.qty-input').on('change', function(){
		var input = $(this);
		if( isNaN(parseInt(input.val())) || parseInt(input.val()) < 1 ){
			input.val('1');
		}
		input.val(Math.max(parseInt(input.val()), 1));
		if( $('.cart-list').length > 0 ){
			addToCartOnclick( input );
		}
	});
	$('.qty-increment').on('click', function(){
		var input = $('.qty-input[data-id=' + $(this).data().id + '][data-size=' + $(this).data().size + ']');
		input.val(Math.max(parseInt(input.val()) + 1, 1));
		if( $('.cart-list').length > 0 ){
			addToCartOnclick( input );
		}
	});
	$('.pdp-image-item img').on('click', function(e){
		e.preventDefault();
		var prevImg = $('.pdp-main_image').find('img').attr('src');
		$('.pdp-main_image').find('img').attr('src', $(this).attr('src'));
		$('.pdp-main_image').zoom({url: $(this).attr('src')});
		$(this).attr('src', prevImg);
	});
	$('.add_to_cart-btn').on('click', function(e){
		e.preventDefault();
		if(!$('#pdp-size-select').val()){
			$('#pdp-size-select').addClass('is-invalid');
		} else {
			$('#pdp-size-select').removeClass('is-invalid');
			addToCart();
		}
	});
	$('#pdp-size-select').on('change', function(){
		$('.pdp-validation').addClass('hidden');
		$('#pdp-size-select').removeClass('is-invalid');
	});
	if (typeof pdpImageUrl !== 'undefined') {
		$('.pdp-main_image').zoom({url: pdpImageUrl});
	}
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

function initUserPageFunctions(){
    $('#userImageUpload').on('submit',(function(e) {
        e.preventDefault();
        var formData = new FormData(this);

        $.ajax({
            type:'POST',
            url: userServiceUrl,
            data:formData,
            cache:false,
            contentType: false,
            processData: false,
            success:function(data){
            	$('.user-avatar-img_wrap img').attr('src', data.url);
            },
            error: function(data){
                console.log("error");
                console.log(data);
            }
        });
    }));

    $("#userImage").on("change", function() {
    	$("#userImageUpload").submit();
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
	if( $('form[name=payment]').length > 0 ){
		deleteCookie('cartId');
		$('form[name=payment]').submit();
	} else {
		setCookie(cartId);
	}
}

function initCartFunctions(){
	$('.cart-remove_btn').on('click', function(){
		var data = {
			itemId: $(this).data().id,
			size: $(this).data().size,
			amount: 0,
			cartId: getCookieValue( 'cartId'),
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

function initUserPgaeFunction(){
	$('.user_page-wrap .profile .profile-avatar').on( 'click', function(){
		$('#userImageUpload input').click();
	});
}

$( document ).ready(function() {
	initUserPgaeFunction();
	initLoginRegisterForm();
	initHomepageSlider();
	initPDPFunctions();
	initCheckoutEvents();
	initHomepageFunction();
	initUserPageFunctions();
	initCartFunctions();
	initSharedEvents();
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

function addToCartOnclick( input ){
	var data = {
		itemId: input.data().id,
		size: input.data().size,
		amount: input.val(),
		cartId: getCookieValue( 'cartId'),
		action:'modify',
		force: true
	}
	addToCart(data);
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
	$.ajax({
		url: cartServiceUrl,
		type: 'POST',
		data: data,
		success: function(data){
			setCookie(data._id);
			$('.minicart .minicart-total').html('&#8381; ' + data.price.items);
			$('.minicart .minicart-qty').text(data.itemsNum);
			$('.cart-total .value .cart-items-price').text(data.price.items);
			result = data;
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
}