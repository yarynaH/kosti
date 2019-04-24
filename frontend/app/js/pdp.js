function initPDPFunctions(){
	$('.qty-decrement').on('click', function(){
		var selector = '.qty-input[data-id=' + $(this).data().id + ']';
		console.log($(this).data().size);
		$(this).data().size ? selector += '[data-size=' + $(this).data().size + ']':false;
		var input = $(selector);
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
		var selector = '.qty-input[data-id=' + $(this).data().id + ']';
		$(this).data().size ? selector += '[data-size=' + $(this).data().size + ']':false;
		var input = $(selector);
		input.val(Math.max(parseInt(input.val()) + 1, 1));
		if( $('.cart-list').length > 0 ){
			addToCartOnclick( input );
		}
	});
	// $('.pdp-image-item img').on('click', function(e){
	// 	e.preventDefault();
	// 	var prevImg = $('.pdp-main_image').find('img').attr('src');
	// 	$('.pdp-main_image').find('img').attr('src', $(this).attr('src'));
	// 	$('.pdp-main_image').zoom({url: $(this).attr('src')});
	// 	$(this).attr('src', prevImg);
	// });
	$('.add_to_cart-btn').on('click', function(e){
		e.preventDefault();
		if($('#pdp-size-select').length && !$('#pdp-size-select').val()){
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
	// if (typeof pdpImageUrl !== 'undefined') {
	// 	$('.pdp-main_image').zoom({url: pdpImageUrl});
	// }
}

$( document ).ready(function() {
	initPDPFunctions();
});

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
