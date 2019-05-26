function initComments(){
	if($('.comments').length > 0){
		$('.comments').on('submit', '.js_comment-form', function( e ){
			e.preventDefault();
			var el = this;
			var formData = { };
			$.each($(this).serializeArray(), function() {
			    formData[this.name] = this.value;
			});
			var parentId = $(el).data('parentid') ? $(el).data('parentid') : $('.js_article-id').data('articleid');
			var data = {
				body: formData.body,
				parent: parentId,
				action: 'addComment',
				//user: $('.header-user').data('usercontentid')
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
			});
		});
		$('.comments').on('click', '.js_answer-comment', function( e ){
			$('form[data-parentid=' + $(this).data('id') + ']').toggleClass('hidden');
		});
		$('.comments').on('click', '.js_comment-like', function( e ){
			e.preventDefault();
			var el = this;
			var data = {
				action: 'vote',
				id: $(el).data('id'),
				//user: $('.header-user').data('userid')
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
		});
		$('.comments').on('click', '.js_comment-remove_btn', function( e ){
			var el = this;
			var data = {
				action: 'remove',
				id: $(el).data('id')
			};
			var call = makeAjaxCall( commentsServiceUrl, 'POST', data, true );
			call.done( function(data){
				$('li[data-id=' + $(el).data('id') + '] > .comments-body').text('Комментарий удален');
			});
		});
	}
}


$( document ).ready(function() {
	initComments();
});