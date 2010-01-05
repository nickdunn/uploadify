<?php
	
	class Extension_Uploadify extends Extension {
		
		public static $params = null;
		
		public function about() {
			return array(
				'name'			=> 'Uploadify',
				'version'		=> '0.4',
				'release-date'	=> '2010-01-05',
				'author'		=> array(
					'name'			=> 'Nick Dunn',
					'website'		=> 'http://airlock.com/'
				),
				'description'	=> 'Add an upload progress bar to file uploads.'
			);
		}
		
		public function getSubscribedDelegates() {
			return array(
				array(
					'page'		=> '/backend/',
					'delegate'	=> 'InitaliseAdminPageHead',
					'callback'	=> 'initaliseAdminPageHead'
				)
			);
		}
				
		public function initaliseAdminPageHead($context) {
			$page = $context['parent']->Page;
			
			if ($page instanceof ContentPublish and ($page->_context['page'] == 'new' || $page->_context['page'] == 'edit')) {
				$page->addStylesheetToHead(URL . '/extensions/uploadify/assets/uploadify.css', 'screen', 991);
				$page->addScriptToHead(URL . '/extensions/uploadify/assets/jquery.uploadify.js', 992);
				$page->addScriptToHead(URL . '/symphony/extension/uploadify/upload_fields/?section=' . $page->_context['section_handle'], 993);
				$page->addScriptToHead(URL . '/extensions/uploadify/assets/apply.js', 994);
			}
			
		}
	}
	
?>