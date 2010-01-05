<?php

	require_once(TOOLKIT . '/class.administrationpage.php');
	require_once(TOOLKIT . '/class.sectionmanager.php');
	
	class ContentExtensionUploadifyUpload_Fields extends AdministrationPage {
		protected $_driver = null;
		
		public function __construct(&$parent){
			parent::__construct($parent);
			$this->_driver = $this->_Parent->ExtensionManager->create('uploadify');
		}
		
		/*
		Returns JSON encoded meta data for any upload fields in this section.
		*/		
		public function __viewIndex() {
			header('content-type: text/javascript');
			
			$sm = new SectionManager($this->_Parent);
			$section = $sm->fetch($sm->fetchIDFromHandle($_GET['section']));
			$fields = array();
			
			foreach ($section->fetchFilterableFields() as $field) {
				
				// create the backend HTML representation of this field
				$html = new XMLElement('html');
				$field->displayPublishPanel($html);
				
				$dom = new DomDocument();
				$dom->loadXML($html->generate());
				
				$xpath = new DomXPath($dom);
				
				// if the generated HTML contains a file upload element
				foreach($xpath->query("//input[@type='file']") as $file) {
					
					$fields[$field->get('element_name')]['section'] = $_GET['section'];
					$fields[$field->get('element_name')]['field_id'] = $field->get('id');
					$fields[$field->get('element_name')]['handle'] = $field->get('element_name');
					$fields[$field->get('element_name')]['destination'] = $field->get('destination');
					
					// if a validator regular expression has been set we need to parse and explode into
					// a format that Uploadify understands (semi-colon delimeted string)
					if ($field->get('validator')) {
						$validator = str_replace('$/i', '', $field->get('validator'));
						$validator = trim($validator, '():?[]\/.');
						$validator = explode('|', $validator);
						foreach ($validator as $type) {
							if ($type == 'jpe?g') {
								$fields[$field->get('element_name')]['types'] .= '*.jpg;*.jpeg;';
							} else {
								$fields[$field->get('element_name')]['types'] .= '*.' . $type . ';';
							}
						}
						$fields[$field->get('element_name')]['types'] = trim($fields[$field->get('element_name')]['types'], ';');
					}
					// if no validation rule, allow all file types
					else {
						$fields[$field->get('element_name')]['types'] = '*.*';
					}
					
				}	
				
			}
			
			echo 'var upload_fields = ', json_encode($fields), ";\n";
			echo 'var PHPSESSID = "', session_id(), "\";\n";
			exit;
		}
	}
	
?>