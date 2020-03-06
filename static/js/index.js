$(function(){
	// 登录注册的切换
	$('#register a').click(function(){
		$('#login').show();
		$('#register').hide();
	});

	$('#login a').click(function(){
		$('#login').hide();
		$('#register').show();
	});
});

// 点击注册按钮，通过ajax提交数据
$('#register .submit').click(function(){
	// 通过ajax提交交
	$.ajax({
		type:'post',
		url:'/api/user/register',
		data:{
			username:$('#register').find('[name="username"]').val(),
			password:$('#register').find('[name="password"]').val(),
			repassword:$('#register').find('[name="repassword"]').val()
		},
		dataType:'json',
		success:function(data){
			alert(data.message);
			if(!data.code){
				// 注册成功
				$('#register').hide();
				$('#login').show();
			}

		}
	});
});


// 点击登录按钮，通过ajax提交数据
$('#login .submit').click(function(){
	console.log($('#login').find('[name="username"]').val());
	// 通过ajax提交
	$.ajax({
		type:'post',
		url:'/api/user/login',
		data:{
			username:$('#login').find('[name="username"]').val(),
			password:$('#login').find('[name="password"]').val(),
		},
		dataType:'json',
		success:function(data){
			alert(data.message);
			console.log(data);
			if(!data.code){
				$('#login').slideUp(1000,function(){
					$('#loginInfo span').text('你好，'+data.userInfo)
					$('#logout').show();
				});
			}
		}
	});
});
// 注销模块
$('#logout').click(function(){
	$.ajax({
		type:'get',
		url:'/api/user/logout',
		success:function(data){
			if(!data.code){
				window.location.reload();
			}
		}
	});
});

//更新评论
function renderComment(arr){
    var innerHtml='';
    for(var i=0;i<arr.length;i++){
    	innerHtml='<header class="clearfix">'
		    +'<img src="img/avatar.png" alt="A Smart Guy" class="avatar">'
		    +'<div class="meta">'
		    +    '<h3><a href="#">'+arr[i].username+'</a></h3>'
		    +    '<span class="date">'
		            +arr[i].postTime
		    +    '</span>'
		    +    '<span class="separator">'
		    +        '-'
		    +   ' </span>'
		        
		    +   '<a href="#create-comment" class="reply-link">Reply</a>   '             
		    +'</div>'
		+'</header>'
		+'<div class="body">'
		 	+arr[i].content
		+'</div>'+innerHtml;
        //innerHtml='<li><span class="comments-user">'+arr[i].username+' </span><span class="comments-date">'+arr[i].postTime+'</span><p>'+arr[i].content+'</p></li>'+innerHtml;
    }
    return innerHtml;
}

//每次文章重载时获取该文章的所有评论
if($('#messageComment').length>0){
    $.ajax({
        type:'GET',
        url:'/api/comment',
        data:{
            contentId:$('#contentId').val(),
            content:$('#commentValue').val(),
        },
        success:function(responseData){
        console.log(responseData);
			var a=responseData.data.content;
            var rendererMD = new marked.Renderer();
            marked.setOptions({
                renderer: rendererMD,
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: false,
                smartLists: true,
                smartypants: false
            });
            marked.setOptions({
                highlight: function (code,a,c) {
                    return hljs.highlightAuto(code).value;
                }
            });
			$('pre').each(function(i, block) {
			    hljs.highlightBlock(block);
			});

            var arr= responseData.data.comments;
            //渲染评论的必要方法
            var renderComments=new Comments();

            //获取评论内容
            $('div.comments').html(renderComments.getComment(arr));

            //清空评论框
            $('#commentValue').val('');

            //展示评论条数
            $('.commentsNum').html(arr.length);

            //首次加载展示三条，每点击一次加载3条
            renderComments.resetComment(3);
            renderComments.loadComments(3);


            // 评论提交
            $('#messageComment').click(function(){
                $.ajax({
                    type:'POST',
                    url:'/api/comment/post',
                    data:{
                        contentId:$('#contentId').val(),
                        content:$('#commentValue').val(),
                    },
                    success:function(responseData){

                        alert(responseData.message);
                        var arr= responseData.data.comments;
                        $('div.comments').html(renderComments.getComment(arr));
                        $('#commentValue').val('');
                        $('.commentsNum').html(arr.length);

                        renderComments.resetComment(3);
                        renderComments.loadComments(3);
                    }
                });
                return false;
            });
            
            
            
        }
    });

}

// 加载评论的基本逻辑
function Comments(){
    this.count=1;
    this.comments=0;
}
// 获取评论内容
Comments.prototype.getComment=function(arr){
    var innerHtml='';
    this.comments=arr.length;//获取评论总数
    for(var i=0;i<arr.length;i++){
        innerHtml='<article class="comment">'
        	+'<header class="clearfix">'
		    +'<img src="../public/img/avatar.png" alt="A Smart Guy" class="avatar">'
		    +'<div class="meta">'
		    +    '<h3><a href="#">'+arr[i].username+'</a></h3>'
		    +    '<span class="date">'
		            +arr[i].postTime
		    +    '</span>'
		    +    '<span class="separator">'
		    +        '-'
		    +   ' </span>'
		        
		    +   '<a href="#create-comment" class="reply-link">Reply</a>   '             
		    +'</div>'
		+'</header>'
		+'<div class="body">'
		 	+arr[i].content
		+'</div></div>'+innerHtml;
    }
    
    return innerHtml;
};
//重置评论按钮
Comments.prototype.resetComment=function (limit){
    this.count=1;
    this.comments=$('div.comments').children().length;//获取评论总数
    $('#load-more').unbind("click");

    if(this.comments<limit){
        $('#load-more').text('..没有了');
    }else{
        $('#load-more').text('加载更多');
    }

    for(var i=1;i<=this.comments;i++){
        if(i>limit){
            $('div.comments').find('[data-index='+ i.toString()+']').css('display','none');
        }
    }
};

//点击加载按钮，根据点击计数加载评论
Comments.prototype.loadComments=function(limit){
    var _this=this;
    $('#load-more').click(function(){
        //console.log([_this.comments,_this.count]);
        if((_this.count+1)*limit>=_this.comments){
            $(this).text('..没有了');

        }
        _this.count++;

        for(var i=1;i<=_this.comments;i++){
            if(_this.count<i*_this.count&&i<=(_this.count)*limit){
                $('div.comments').find('[data-index='+ i.toString()+']').slideDown(300);
            }
        }
    });
};

