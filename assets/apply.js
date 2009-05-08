$(document).ready(function() { 
	
	var total = 0;
	var complete = 0;
	
	var uploadifies = [];
	var form = $('form');
	
	var file_fields = $('label.file');
	
	file_fields.each(function(i) {
		
		var label = $(this);
		var file = $(this).find(' > span');
		var input = $('input', file);
		
			var upload_file_types = '';
			var upload_destination = '';
			for(var field in upload_fields) {
				if ('fields[' + upload_fields[field].handle + ']' == input.attr('name')) {
					upload_file_types = upload_fields[field].types;
					upload_destination = upload_fields[field].destination;
				};
			}

			file.append('<div class="uploadify" id="uploadify-' + i + '">TEST</div>')
			.find('.uploadify').fileUpload({ 
				
				'uploader': '/extensions/uploadify/assets/uploader.swf',
				'script': '/extensions/uploadify/assets/upload.php',
				
				'folder': upload_destination,
				fileExt: upload_file_types,
				sizeLimit: $('input[name="MAX_FILE_SIZE"]', form).val(),
				
				'buttonImg': '/extensions/uploadify/assets/choose.png',
				'width': 68,
				'height': 15,
				'wmode': 'transparent',
				
				scriptAccess: 'always',

				onSelectOnce: function(event, data) {
					
					if (data.fileCount == 1) {
						if ($.inArray("uploadify-" + i, uploadifies)) {
							uploadifies.push("uploadify-" + i);
						}
					}

					if (label.parent().hasClass('invalid')) {
						
						//label.find('+ p').remove();
					}
					
				},

				onError: function(event, queueId, fileObj, errorObj) {
					switch (errorObj.type) {
						case 'File Size':
							wrapFormElementWithError(label, '<div class="invalid"></div>').after('<p>File chosen exceeds the maximum allowed upload size of ' + errorObj.sizeLimit + ' bytes specified by Symphony.</p>');
						break;
					}
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
	
	form.submit(function(e){
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
		if (complete == total) {
			form.unbind('submit');
			form.find('form input[type="submit"]').click();
		}
	}
	
	function wrapFormElementWithError(element, message) {
		if (element.parent().hasClass('invalid')) {
			element.parent().find('p').html(message);
		} else {
			element.wrap('<div class="invalid"></div>').after('<p>' + message + '</p>');
		}		
	}
	 
});