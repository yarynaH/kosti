function initComments(){
	if($('.js_article-comments').length > 0){
		$('.js_article-comments').on('click', '.js_answer-comment', function( e ){
			$('form[data-parentid=' + $(this).data('id') + ']').toggleClass('hidden');
		});
		$('.js_article-comments').on('submit', '.js_comment-form', function( e ){
			e.preventDefault();
			if( !checkUserLoggedIn() ){
				showLogin(e);
			} else{
				var formData = { };
				$.each($(this).serializeArray(), function() {
				    formData[this.name] = this.value;
				});
				addComment(this, formData);
			}
		});
		$('.js_remove_comment-form').on('submit', function( e ){
			e.preventDefault();
			if( !checkUserLoggedIn() ){
				showLogin(e);
			} else{
				var formData = { };
				$.each($(this).serializeArray(), function() {
				    formData[this.name] = this.value;
				});
				removeComment(formData);
			}
		});
		$('.js_article-comments').on('click', '.js_comment-like', function( e ){
			e.preventDefault();
			if( !checkUserLoggedIn() ){
				showLogin(e);
			} else {
				likeComment(this);
			}
		});
		$('.js_article-comments').on('click', '.js_comment-remove_btn', function( e ){
			if( !checkUserLoggedIn() ){
				showLogin(e);
			} else {
				showRemoveFunction(this, e, 'remove');
			}
		});
		$('.js_article-comments').on('click', '.js_report-comment', function( e ){
			if( !checkUserLoggedIn() ){
				showLogin(e);
			} else {
				showRemoveFunction(this, e, 'report');
			}
		});
	}
}

function likeComment( el ){
	var data = {
		action: 'vote',
		id: $(el).data('id')
	};
	var call = makeAjaxCall( commentsServiceUrl, 'POST', data, true );
	call.done( function(data){
		$(el).text(data.rate);
		if( data.voted ){
			$(el).addClass('active');
		} else {
			$(el).removeClass('active');
		}
	});
}

function addComment( el, formData ){
	var parentId = $(el).data('parentid') ? $(el).data('parentid') : $('.js_article-id').data('articleid');
	var data = {
		body: formData.body,
		parent: parentId,
		action: 'addComment'
	};
	var call = makeAjaxCall( commentsServiceUrl, 'POST', data, true );
	call.done( function(data){
		if( parentId != $('.js_article-id').data('articleid') ){
			$('form[data-parentid=' + parentId + ']').addClass('hidden');
		}
		if(parentId == $('.js_article-id').data('articleid') && !$('ul.js_comments-list[data-parentid=' + parentId + ']').length){
			$('.js_article-comments').append('<ul class="comments-list js_comments-list" data-parentid="' + parentId + '"></ul>');
		} else if(!$('ul.js_comments-list[data-parentid=' + parentId + ']').length) {
			$('li.js_comment[data-id=' + parentId + ']').append('<ul class="comments-list js_comments-list" data-parentid="' + parentId + '"></ul>');
		}
		$('ul.js_comments-list[data-parentid=' + parentId + ']').append(data);
		$('form[data-parentid=' + parentId + '] textarea').val('');

		var scroll_value = ($('.js_comment_scroll').offset().top - (window.innerHeight / 2) );
		$('html, body').scrollTop(scroll_value);

		$('.js_comment').removeClass('js_comment_scroll');
	});
}

function showRemoveFunction( el, e, action ){
	e.stopPropagation();
	$('.modal-remove_comment').addClass('show');
	$('input.js_comment-remove-id').val($(el).data('id'));
	$('input.js_comment-remove-action').val(action);
}

function removeComment(formData){
	var data = {
		action: formData.action,
		id: formData.id,
		reason: formData.reason
	};
	var call = makeAjaxCall( commentsServiceUrl, 'POST', data, true );
	call.done( function(data){
		$('input.js_comment-remove-id').val('');
		if( data ){
			$('li[data-id=' + formData.id + '] > .comments-body').addClass('deleted').text('Комментарий удален');
			$('.modal-remove_comment').removeClass('show');
			$(el).remove();
		}
	});
}


$( document ).ready(function() {
	initComments();
});