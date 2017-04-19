/* 
*	jQuery文件上传插件,封装UI,上传处理操作采用Baidu WebUploader;
*	@Author 黑爪爪;
*/
(function( $ ) {
    $.fn.extend({
		/*
		*	上传方法 opt为参数配置;
		*	serverCallBack回调函数 每个文件上传至服务端后,服务端返回参数,无论成功失败都会调用 参数为服务器返回信息;
		*/
        diyUpload:function( opt, serverCallBack ) {
 			if ( typeof opt != "object" ) {
				alert('参数错误!');
				return;
			}

			var $fileInput = $(this);
			var $fileInputId = $fileInput.attr('id');

			//组装参数;
			if( opt.url ) {
				opt.server = opt.url;
				delete opt.url;
			}

			if( opt.success ) {
				var successCallBack = opt.success;
				delete opt.success;
			}

			if( opt.error ) {
				var errorCallBack = opt.error;
				delete opt.error;
			}

			//迭代出默认配置
			$.each( getOption( '#'+$fileInputId ),function( key, value ){
					opt[ key ] = opt[ key ] || value;
			});

			if ( opt.buttonText ) {
				opt['pick']['label'] = opt.buttonText;
				delete opt.buttonText;
			}

			var webUploader = getUploader( opt );
			if ( !WebUploader.Uploader.support() ) {
				alert( ' 上传组件不支持您的浏览器！');
				return false;
       		}
			//绑定文件加入队列事件;
			webUploader.on('fileQueued', function( file ) {
				createBox( $fileInput, file ,webUploader);
			});

			//进度条事件
			webUploader.on('uploadProgress',function( file, percentage  ){
				var $fileBox = $('#fileBox_'+file.id);
				var $diyBar = $fileBox.find('.diyBar');
				$diyBar.show();
				percentage = percentage*100;
				showDiyProgress( percentage.toFixed(2), $diyBar);
			});

			//全部上传结束后触发;
			webUploader.on('uploadFinished', function(){
				$fileInput.parent().find('.parentFileBox').children('.diyButton').remove();
			});

			//绑定发送至服务端返回后触发事件;
			webUploader.on('uploadAccept', function( object ,data ){
				if ( serverCallBack ) serverCallBack( data );
			});

			//上传成功后触发事件;
			webUploader.on('uploadSuccess',function( file, response ){
				var $fileBox = $('#fileBox_'+file.id);
				var $diyBar = $fileBox.find('.diyBar');
				var $diyProgress = $fileBox.find('.diyProgress');
				var $cancel = $fileBox.find('.diyCancel');
				$fileBox.removeClass('diyUploadHover');
				showDiyProgress( 100, $diyBar , '上传成功!' );
				$diyProgress.addClass("success");
				if ( successCallBack ) {
					successCallBack( response );
				}
				var timer=setInterval(function(){
                    clearInterval(timer);
                    $diyBar.hide();
                },1500);
			});

			//上传失败后触发事件;
			webUploader.on('uploadError',function( file, reason ){
				var $fileBox = $('#fileBox_'+file.id);
				var $diyBar = $fileBox.find('.diyBar');
				var $diyProgress = $fileBox.find('.diyProgress');
				var $cancel = $fileBox.find('.diyCancel');
				showDiyProgress( 100, $diyBar , '上传失败!' );
				$diyProgress.addClass("fail");
                var timer=setInterval(function(){
                    clearInterval(timer);
                    $diyBar.hide();
                },1000);
				var err = '上传失败!文件:'+file.name+' 错误码:'+reason;
				if ( errorCallBack ) {
					errorCallBack( err );
				}
			});

			//选择文件错误触发事件;
			webUploader.on('error', function( code ) {
				var text = '';
				switch( code ) {
					case  'F_DUPLICATE' : text = '该文件已经被选择了!' ;
					break;
					case  'Q_EXCEED_NUM_LIMIT' : text = '上传文件数量超过限制!' ;
					break;
					case  'F_EXCEED_SIZE' : text = '文件大小超过限制!';
					break;
					case  'Q_EXCEED_SIZE_LIMIT' : text = '所有文件总大小超过限制!';
					break;
					case 'Q_TYPE_DENIED' : text = '文件类型不正确或者是空文件!';
					break;
					default : text = '未知错误!';
 					break;
				}
            	alert( text );
        	});
        }
    });

	//Web Uploader默认配置;
	function getOption(objId) {
		/*
		*	配置文件同webUploader一致,这里只给出默认配置.
		*	具体参照:http://fex.baidu.com/webuploader/doc/index.html
		*/
		return {
			//按钮容器;
			pick:{
				id:objId,
				label:"点击选择图片"
			},
			//类型限制;
			accept:{
				title:"Images",
				extensions:"gif,jpg,jpeg,bmp,png",
				mimeTypes:"image/*"
			},
			//文件上传方式
			method:"POST",
			//服务器地址;
			server:"",
			//是否已二进制的流的方式发送文件，这样整个上传内容php://input都为文件内容
			sendAsBinary:false,
			// 开起分片上传。 thinkphp的上传类测试分片无效,图片丢失;
			chunked:false,
			// 分片大小
			chunkSize:512 * 1024,
			//最大上传的文件数量, 总文件大小,单个文件大小(单位字节);
			threads:1,   //上传并发数
			fileNumLimit:10,
			fileSizeLimit:200 * 1024 * 1024,
			fileSingleSizeLimit:20 * 1024 * 1024
		};
	}

	//实例化Web Uploader
	function getUploader( opt ) {
		return new WebUploader.Uploader( opt );
	}

	//操作进度条;
	function showDiyProgress( progress, $diyBar, text ) {
		if ( progress >= 100 ) {
			progress = progress + '%';
			text = text || '上传完成';
		} else {
			progress = progress + '%';
			text = text || progress;
		}
		var $diyProgress = $diyBar.find('.diyProgress');
		var $diyProgressText = $diyBar.find('.diyProgressText');
		$diyProgress.width( progress );
		$diyProgressText.text( text );
	}
	//取消事件;
	function removeLi ( $li ,file_id ,webUploader) {
		webUploader.removeFile( file_id );
		if ( $li.siblings('li').length <= 0 ) {
			$li.parents('.parentFileBox').remove();
		} else {
			$li.remove();
		}
	}
	//创建文件操作div;
	function createBox( $fileInput, file, webUploader ) {
		var file_id = file.id;
		//var $parentFileBox = $fileInput.next('.parentFileBox');
		var $parentFileBox = $fileInput.parent().find('.parentFileBox');
		//添加父系容器;
		if ( $parentFileBox.length <= 0 ) {
			var div = '<div class="parentFileBox"> \
						<ul class="fileBoxUl"></ul>\
					</div>';
			$fileInput.parent().append( div );
			$parentFileBox = $fileInput.parent().find('.parentFileBox');
		}
		webUploader.upload();
		
		//添加子容器;
		var li = '<li id="fileBox_'+file_id+'" class="diyUploadHover"> \
					<span class="diyFileName">'+file.name+'</span>\
					<a class="icon-delete diyCancel"></a> \
					<div class="diyBar"> \
						<div class="diyProgress"></div> \
						<div class="diyProgressText">0%</div> \
					</div> \
				</li>';
		$parentFileBox.children('.fileBoxUl').append( li );

		var $fileBox = $parentFileBox.find('#fileBox_'+file_id);
		//绑定取消事件;
		var $diyCancel = $fileBox.children('.diyCancel').one('click',function(){
			removeLi( $(this).parent('li'), file_id, webUploader );
		});
	}
})( jQuery );