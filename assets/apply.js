(function($) {

	$(document).ready(function() {
		
		var uploadifies = [];
		var form = $('form');

		var file_fields = $('label.file');
		var size_limit = $('input[name="MAX_FILE_SIZE"]', form).val();

		var submit_text = 'Uploading, please wait...';
		var submit_text_original = form.find('input[type="submit"]').val();
		var size_error = 'File chosen exceeds the maximum allowed upload size of ' + size_limit + ' bytes specified by Symphony.';
		var required_error = 'This field is required.';

		file_fields.each(function(i) {

			var label = $(this);
			var file = $(this).find(' > span');
			var input = $('input', file);

			var upload_file_types = '';
			var upload_destination = '';
			var section = '';
			var field_id = '';
			
			// find this field's meta data from the JSON feed of upload fields
			for(var field in upload_fields) {
				if (input.attr('name') == 'fields[' + upload_fields[field].handle + ']') {
					upload_file_types = upload_fields[field].types;
					upload_destination = upload_fields[field].destination;
					section_id = upload_fields[field].section;
					field_id = upload_fields[field].field_id;
				};
			}

			var required = false;
			if ($(this).find('i').length == 0) required = true;
			
			// add uploadify container inside this field's HTML
			file.append('<div class="uploadify" id="uploadify-' + i + '"></div>');

			var root = $('h1:first a').attr('href');
			root = root.replace(/http:\/\//, '');
			root_split = root.split('/');
			root = '/';
			for(var j = 1; j < root_split.length; j++) {
				if (root_split[j] != '') root += root_split[j] + '/';
			}
			
			// then immediately select and apply the uploadify plugin to it
			$('#uploadify-' + i).fileUpload({ 

				'uploader': root + 'extensions/uploadify/assets/uploader.swf',
				'script': root + 'symphony/extension/uploadify/upload/',

				'folder': upload_destination,
				'fileExt': upload_file_types,
				'fileDesc': label.get(0).childNodes[0].nodeValue,
				'sizeLimit': size_limit,
				
				'scriptData': {
					'PHPSESSID' : PHPSESSID,
					'section': section_id,
					'field': field_id
				},
				
				'buttonImg': root + 'extensions/uploadify/assets/choose.png',
				'width': 68,
				'height': 15,
				'wmode': 'transparent',

				'scriptAccess': 'always',
				
				onSelect: function(event, queueId, fileObj) {
					if (fileObj.size > size_limit) {
						wrapFormElementWithError(label, size_error);
						updateQueue(i, required, size_error);
					} else {
						removeElementError(label);
						updateQueue(i, required, null);
					}
				},

				//Should never need this since sizes are caught in the onSelect
				onError: function(event, queueId, fileObj, errorObj) {
					switch (errorObj.type) {
						case 'File Size':
							wrapFormElementWithError(label, size_error);
							updateQueue(i, required, size_error);
						break;
					}
					return false;
				},

				onComplete: function(event, queueId, fileObj, response, data) {
					if (response == '100') {
						file.append('<input type="hidden" name="' + input.attr('name') + '" value="' + fileObj.filePath.replace(/\/workspace/,'') + '" />');
						registerComplete(i);
					} else {
						var message = response.split('|')[1];
						wrapFormElementWithError(label, message);
						updateQueue(i, required, message);
						form.find('input[type="submit"]').val(submit_text_original);
					}
					
				}

			});
			
			// file exists
			var exists = false;
			if ($('a', this).length) {

				exists = true;
				$('.fileUploaderBtn', file).hide();

				var remove_file = $('em', this);
				var remove_clone = remove_file.clone();
				remove_file.remove();
				remove_clone.click(function() {
					// show uploadify Flash
					$('.fileUploaderBtn', file).show();
					$('a', file).hide();
					// remove 'Remove File' link
					$(this).remove();
					// remove hidden value
					file.find('input[type="hidden"]').remove();
					if (required) updateQueue(i, required, required_error);
				})
				$('a', this).after(remove_clone);

			}
			// file does not already exist
			else {
				input.remove();
			}

			if (required && !exists) updateQueue(i, required, required_error);
			
		});
		
		function registerComplete(id) {

			var complete = true;

			for(var f in uploadifies) {
				// if this file has just completed
				if (uploadifies[f].id == id) {
					uploadifies[f].error = null;
					uploadifies[f].complete = true;
				}
				// if a file is incomplete, we can't send the form
				if (uploadifies[f].complete == false) complete = false;
			}

			if (complete) {
				form.unbind('submit');
				form.find('input[type="submit"]').click();
			}

		}

		form.submit(function(e){

			// there are no uploads to submit, bypass error checking and submit
			if (uploadifies.length == 0) {
				return;
			}

			e.preventDefault();

			var errors = false;

			for(var f in uploadifies) {
				// if any file field has an error
				if (uploadifies[f].error) {
					errors = true;
					var label = $('#uploadify-' + uploadifies[f].id).parents('.field').find('label');
					wrapFormElementWithError(label, uploadifies[f].error);
				}
			}

			if (!errors) {

				form.find('input[type="submit"]').val(submit_text)

				for(var f in uploadifies) {
					// start the upload
					if (uploadifies[f].id != undefined) {
						$('#uploadify-' + uploadifies[f].id).fileUploadStart();
					}				
				}
			}

		});

	function wrapFormElementWithError(element, message) {
		var parent = element.parent();
		if (parent.hasClass('invalid')) {
			parent.find('p').html(message);
		} else {
			if (parent.hasClass('was-invalid')) {
				parent.attr('class', 'invalid');
			} else {
				element.wrap('<div class="invalid"></div>');
			}
			element.after('<p class="message">' + message + '</p>');
		}
	}

	function removeElementError(element) {
		var field = $(element).parents('.field');
		var invalid = $(field).find('.invalid');
		if (invalid.length) {
			invalid.attr('class', 'was-invalid');
			invalid.find('p.message').remove();
		}
	}

		function updateQueue(id, required, error) {
			if (!inQueue(id)) {
				uploadifies.push({ 'id' : id, 'required' : required, 'error' : error, 'complete': false });
			} else {
				for(var f in uploadifies) {
					if (uploadifies[f].id == id) {
						uploadifies[f].required = required;
						if (error == '' || error == undefined || error == null) {
							uploadifies[f].error = null;
						} else {
							uploadifies[f].error = error;
						}

					}
				}
			}
		}

		function inQueue(id) {
			for(var f in uploadifies) {
				if (uploadifies[f].id == id) return true;
			}
			return false;
		}

	});
	
})(jQuery);