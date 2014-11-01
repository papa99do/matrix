var converter = new Showdown.converter();

function convertContentToHtml() {
	$('#content-html').html(converter.makeHtml($('#content-markdown').val()));
	$('#content-html code').each(function(i, block) {
	    hljs.highlightBlock(block);
	});
}

function showContent(row, col, contentId) {
	if (contentId) {
		$.get('/api/contents/' + contentId, function(data) {
			show(row, col, data.content);
		});
	} else {
		show(row, col, '');
	}
}

function show(row, col, content) {
	$('#contentModalLabel').text(row + ' - ' + col);
	
	$('#content-markdown').val(content);
	
	convertContentToHtml();
	
	toggleContentEditMode(!content);
	
	$('#content-modal').modal('show');
}

function saveContent() {
	convertContentToHtml();
	toggleContentEditMode(false);
}

function toggleContentEditMode(editMode) {
	if (editMode) {
		$('#content-html').hide();
		$('#content-markdown').show();		
		$('#edit-content-btn').hide();
		$('#save-content-btn').show();
	} else {
		$('#content-html').show();
		$('#content-markdown').hide();		
		$('#edit-content-btn').show();
		$('#save-content-btn').hide();
	}
}