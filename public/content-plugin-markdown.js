(function($, matrixManager) {

var currentContent;

var converter = new Showdown.converter();

var convertContentToHtml = function convertContentToHtml() {
	$('#markdown-viewer').html(converter.makeHtml($('#markdown-editor').val()));
	$('#markdown-viewer code').each(function(i, block) {
	    hljs.highlightBlock(block);
	});
};

var renderContent = function renderContent(content) {

	var html = '\
		<a class="cell-link" href="#" onclick="window.plugins.md.showContent({{rowId}}, {{columnId}})">\
			<i class="glyphicon glyphicon-{{star}}"></i>\
		</a>';

	return populate(html, {
		rowId: content.rowId,
		columnId: content.columnId,
		star: content._id ? 'star' : 'star-empty'
	});
};

var sharedHtml = '\
<div class="modal fade" id="markdown-modal" tabindex="-1" role="dialog" aria-labelledby="markdown-modal-label" aria-hidden="true">\
  <div class="modal-dialog modal-lg">\
    <div class="modal-content">\
      <div class="modal-header">\
		<span class="pull-right">\
			<button type="button" class="btn btn-default btn-sm markdown-view-component" id="edit-markdown-btn" onclick="window.plugins.md.toggleContentEditMode(true)">Edit</button>\
			<button type="button" class="btn btn-default btn-sm markdown-edit-component" id="preview-markdown-btn" onclick="window.plugins.md.previewContent()">Preview</button>\
			<button type="button" class="btn btn-primary btn-sm markdown-edit-component" id="save-markdown-btn" onclick="window.plugins.md.saveContent()">Save</button>\
		</span>\
        <button type="button" class="close pull-left" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\
        <h4 class="modal-title" id="markdown-modal-label">Content</h4>\
      </div>\
      <div class="modal-body">\
        <textarea class="form-control markdown-edit-component" rows="10" id="markdown-editor"></textarea>\
		<div class="markdown-view-component" id="markdown-viewer"></div>\
      </div>\
    </div>\
  </div>\
</div>\
';

var showContent = function showContent(rowId, columnId) {

	currentContent = matrixManager.getContent(rowId, columnId);

	if (!currentContent._id) {
		showCurrentContent(true);
	} else {
		matrixManager.getFullContent(currentContent._id, function(content) {
			currentContent = content;
			showCurrentContent(false);
		});
	}
};

function showCurrentContent(editMode) {
	var rowLabel = matrixManager.getRowLabel(currentContent.rowId);
	var columnLabel = matrixManager.getColumnLabel(currentContent.columnId);

	$('#markdown-modal-label').text(rowLabel + ' - ' + columnLabel);
	$('#markdown-editor').val(currentContent.fullContent || '');
	convertContentToHtml();
	toggleContentEditMode(editMode);

	$('#markdown-modal').modal('show');
}

var toggleContentEditMode = function toggleContentEditMode(editMode) {
	if (editMode) {
		$('.markdown-view-component').hide();
		$('.markdown-edit-component').show();
	} else {
		$('.markdown-view-component').show();
		$('.markdown-edit-component').hide();
	}
};

var previewContent = function previewContent() {
	convertContentToHtml();
	toggleContentEditMode(false);
	$('#save-markdown-btn').show();
};

var saveContent = function saveContent() {
	currentContent.fullContent = $('#markdown-editor').val();
	matrixManager.saveContent(currentContent, function() {
		convertContentToHtml();
		toggleContentEditMode(false);
	});
};

matrixManager.registerPlugin({
	name: 'md',
	displayName: 'Markdown',
	lazyLoading: true,
	renderContent: renderContent,
	sharedHtml: sharedHtml,

	// exported to be used by self
	showContent: showContent,
	toggleContentEditMode: toggleContentEditMode,
	previewContent: previewContent,
	saveContent: saveContent

});


})(jQuery, matrixManager);
