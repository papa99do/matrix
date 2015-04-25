(function($, matrixManager) {

var currentContent;

var convertContentToHtml = function convertContentToHtml() {
	$('#embedded-html-viewer').html($('#embedded-html-editor').val());
};

var renderContent = function renderContent(content) {

	var html = '\
	  <div class="embedded-html-content">\
	    <div>{{content}}</div>\
			<div class="embedded-html-edit-icon">\
			  <a href="#" onclick="window.plugins.html.editContent({{rowId}}, {{columnId}})">\
			    <i class="glyphicon glyphicon-pencil"></i>\
		    </a>\
			</div>\
		</div>';

	return populate(html, content);
};

var sharedHtml = '\
<style>\
  .embedded-html-content {position: relative;}\
	.embedded-html-edit-icon {position:absolute; top:0px; right:0px; display:none;}\
	.embedded-html-content:hover .embedded-html-edit-icon {display:block;}\
</style>\
<div class="modal fade" id="embedded-html-modal" tabindex="-1" role="dialog" aria-labelledby="embedded-html-modal-label" aria-hidden="true">\
  <div class="modal-dialog modal-lg">\
    <div class="modal-content">\
      <div class="modal-header">\
		<span class="pull-right">\
			<button type="button" class="btn btn-default btn-sm embedded-html-view-component" id="edit-embedded-html-btn" onclick="window.plugins.html.toggleContentEditMode(true)">Edit</button>\
			<button type="button" class="btn btn-default btn-sm embedded-html-edit-component" id="preview-embedded-html-btn" onclick="window.plugins.html.previewContent()">Preview</button>\
			<button type="button" class="btn btn-primary btn-sm embedded-html-edit-component" id="save-embedded-html-btn" onclick="window.plugins.html.saveContent()">Save</button>\
		</span>\
        <button type="button" class="close pull-left" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
        <h4 class="modal-title" id="embedded-html-modal-label">Content</h4>\
      </div>\
      <div class="modal-body">\
        <textarea class="form-control embedded-html-edit-component" rows="10" id="embedded-html-editor"></textarea>\
		<div class="embedded-html-view-component" id="embedded-html-viewer"></div>\
      </div>\
    </div>\
  </div>\
</div>\
';

var editContent = function editContent(rowId, columnId) {
	currentContent = matrixManager.getContent(rowId, columnId);
	var rowLabel = matrixManager.getRowLabel(rowId);
	var columnLabel = matrixManager.getColumnLabel(columnId);

	$('#embedded-html-modal-label').text(rowLabel + ' - ' + columnLabel);
	$('#embedded-html-editor').val(currentContent.content || '');
	convertContentToHtml();
	toggleContentEditMode(true);

	$('#embedded-html-modal').modal('show');
}

var toggleContentEditMode = function toggleContentEditMode(editMode) {
	if (editMode) {
		$('.embedded-html-view-component').hide();
		$('.embedded-html-edit-component').show();
	} else {
		$('.embedded-html-view-component').show();
		$('.embedded-html-edit-component').hide();
	}
};

var previewContent = function previewContent() {
	convertContentToHtml();
	toggleContentEditMode(false);
	$('#save-embedded-html-btn').show();
};

var saveContent = function saveContent() {
	currentContent.content = $('#embedded-html-editor').val();
	matrixManager.saveContent(currentContent, function() {
		convertContentToHtml();
		$('#embedded-html-modal').modal('hide');
	});
};

matrixManager.registerPlugin({
	name: 'html',
	displayName: 'Embedded Html',
	lazyLoading: false,
	renderContent: renderContent,
	sharedHtml: sharedHtml,

	// exported to be used by self
	editContent: editContent,
	toggleContentEditMode: toggleContentEditMode,
	previewContent: previewContent,
	saveContent: saveContent

});


})(jQuery, matrixManager);
