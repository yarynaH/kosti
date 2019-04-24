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

	$('.user_page-wrap .profile .profile-avatar').on( 'click', function(){
		$('#userImageUpload input').click();
	});
}

$( document ).ready(function() {
	initUserPageFunctions();
});
