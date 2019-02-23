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
				'<a href=' + data.url + '><img src="' + data.image.url + '" alt="' + data.displayName + '"></a>');
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

	function addToCart(){
		var data = {
			action:'modify',
			cartId: getCookieValue( 'cartId'),
			itemId: $('input[name=productId]').val(),
			amount: $('input[name=quantity]').val(),
			size: $('select[name=itemSize]').val()
		};
		$.ajax({
			url: 'http://kosti.local/_/service/com.myurchenko.kostirpg/cart',
			type: 'POST',
			data: data,
			success: function(data){
				setCookie(data._id);
				$('.minicart .minicart-total').html('&#8381; ' + data.total);
				$('.minicart .minicart-qty').text(data.itemsNum);
			}
		});
	}
}

function initCheckoutEvents(){
	if( $('form[name=payment]').length > 0 ){
		$('form[name=payment]').submit();
	}
	$('.checkout-action .checkout-continue').on('click', function(e){
		$('form.checkout-form input, form.checkout-form select').each(function(){
			if( $(this).val() == null || $(this).val() == '' ){
				e.preventDefault();
				$(this).parent().addClass('is-invalid');
			}
		});
	})
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
		var data = {
			content: $(this).data('contentid'),
			user: $('.header-user').data('userid')
		};
		var btn = this;
        $.ajax({
            type:'POST',
            url: contentServiceUrl,
            data: data,
            success:function(data){
            	$(btn).html('<span>' + (Array.isArray(data.votes) ? data.votes.length : '1')  + '</span>');
            },
            error: function(data){
                console.log("error");
                console.log(data);
            }
        });
	});
	setCookie(cartId);
}

function setCookie( cartId ){
	document.cookie = "cartId=" + cartId + "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
}

$( document ).ready(function() {
	initLoginRegisterForm();
	initHomepageSlider();
	initPDPFunctions();
	initCheckoutEvents();
	initHomepageFunction();
	initUserPageFunctions();
	initSharedEvents();
});

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}