<?php

	require_once(TOOLKIT . '/class.administrationpage.php');
	require_once(TOOLKIT . '/class.sectionmanager.php');
	require_once(TOOLKIT . '/class.entrymanager.php');
	require_once(TOOLKIT . '/class.fieldmanager.php');
	require_once(TOOLKIT . '/class.field.php');

	class ContentExtensionUploadifyUpload extends AdministrationPage {
		protected $_driver = null;
		
		public function __construct(&$parent){
			parent::__construct($parent);
			$this->_driver = $this->_Parent->ExtensionManager->create('uploadify');
		}
		
		public function __viewIndex() {
			
			$sm = new SectionManager($this->_Parent);
			$section_id = $sm->fetchIDFromHandle($_GET['section']);
			$section = $sm->fetch($section_id);
			
			$field_id = $_GET['field'];
			
			$fields = $section->fetchFields();
			foreach($fields as $field) {
				if ($field->get('id') == $field_id) $upload_field = $field;
			}
			
			$error = false;
			
			if (!$upload_field) die('0|Invalid Field ID');
			
			$status = $upload_field->checkPostFieldData($_FILES['Filedata'], $message);
			if ($status != Field::__OK__) die($status . '|' . $message);
			
			$processData = $upload_field->processRawFieldData($_FILES['Filedata'], $status, $message);
			if ($status != Field::__OK__) die($status . '|' . $message);
			
			echo(Field::__OK__);
			die;
		}
	}