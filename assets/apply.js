$(document).ready(function() { 
	
	var total = 0;
	var complete = 0;
	
	$('label.file > span').each(function(i) {
		var file = $(this);
		var input = $('input', file);
		
		var types = '';
		var destination = '';
		for(var field in upload_fields) {
			if ('fields[' + upload_fields[field].handle + ']' == input.attr('name')) {
				types = upload_fields[field].types;
				destination = upload_fields[field].destination;
			};
		}
		
		file.append('<div class="uploadify" id="uploadify-' + i + '">TEST</div>')
		.find('.uploadify').fileUpload({ 
			'uploader': '/extensions/uploadify/assets/uploader.swf',
			'script': '/extensions/uploadify/assets/upload.php',
			'buttonImg': '/extensions/uploadify/assets/choose.png',
			'width': 68,
			'height': 15,
			'folder': destination,
			'wmode': 'transparent',
			scriptAccess: 'always',
			fileExt: types,
			buttonText: 'Browse files',
			
			onError: function(event, queueId, fileObj, errorObj) {
				console.dir(errorObj);
			},
			
			onComplete: function(event, queueId, fileObj, response, data) {
				file.append('<input type="hidden" name="' + input.attr('name') + '" value="' + fileObj.filePath.replace(/\/workspace/,'') + '" />');
				registerComplete();
			}

		});
		
		// if existing file
		if ($('a', this).length) {
			
			$('.fileUploaderBtn', file).hide();
			
			// rather than unbinding the "Remove file" text, clone it and re-append with a new click event
			var remove_file = $('em', this);
			var remove_clone = remove_file.clone();
			remove_file.remove();
			remove_clone.click(function() {
				$('.fileUploaderBtn', file).show();
				$('a', file).hide();
				$(this).remove();
				total++;
			})
			$('a', this).after(remove_clone);

		} else {
			
			input.remove();
			total++;
			
		}
		
	});
	
	$('form').submit(function(e){

		// TODO: handle required fields
		$('.uploadify').each(function() {
			var self = $(this);
			self.parent().find('.fileUploaderBtn:visible').each(function() {
				e.preventDefault();
				self.fileUploadStart();
			});			
		});
	});
	
	function registerComplete() {
		complete++;
		console.log([complete, total]);
		if (complete == total) {
			$('form').unbind('submit');
			$('form input[type="submit"]').click();
		}
	}
	 
});