var currentContent, $selectedCell;
var converter = new Showdown.converter();

function convertContentToHtml() {
	$('#content-html').html(converter.makeHtml($('#content-markdown').val()));
	$('#content-html code').each(function(i, block) {
	    hljs.highlightBlock(block);
	});
}

function showContent(elem, rowId, columnId, contentId) {
	$selectedCell = $(elem).parent();
	if (contentId) {
		$.get('/api/contents/' + contentId, function(data) {
			currentContent = data;
			show(rowId, columnId, data.content);
		});
	} else {
		currentContent = {rowId: rowId, columnId: columnId, matrixId: currentMatrix._id};
		show(rowId, columnId, '');
	}
}

function show(rowId, columnId, content) {
	var rowLabel = getLabelById(currentMatrix.rows, rowId);
	var columnLabel = getLabelById(currentMatrix.columns, columnId);
	
	$('#contentModalLabel').text(rowLabel + ' - ' + columnLabel);
	
	$('#content-markdown').val(content);
	
	convertContentToHtml();
	
	toggleContentEditMode(!content);
	
	$('#content-modal').modal('show');
}

function saveContent() {
	convertContentToHtml();
	currentContent.content = $('#content-markdown').val();
	var url = '/api/contents';
	if (currentContent._id) {
		url = url + '/' + currentContent._id; 
	}
	
	$.post(url, currentContent)
	.done(function(content) {
		
		if (!currentContent._id) {
			updateContentMap(content);
			$selectedCell.html(contentColumn({
				rowId: content.rowId,
				colId: content.columnId,
				contentId: content._id
			}));
		}
		currentContent = content;
		
		newAlert('success', 'Content saved!');
		toggleContentEditMode(false);
	})
	.fail(function() {
		newAlert('danger', 'ERROR!');
	});
	
}

function updateContentMap(content) {
	if (!contentMap[content.rowId]) contentMap[content.rowId] = {};
	contentMap[content.rowId][content.columnId] = content._id;
}

function previewContent() {
	convertContentToHtml();
	toggleContentEditMode(false);
	$('#save-content-btn').show();
}

function toggleContentEditMode(editMode) {
	if (editMode) {
		$('#content-html').hide();
		$('#content-markdown').show();		
		$('#edit-content-btn').hide();
		$('#save-content-btn').show();
		$('#preview-content-btn').show();
	} else {
		$('#content-html').show();
		$('#content-markdown').hide();		
		$('#edit-content-btn').show();
		$('#save-content-btn').hide();
		$('#preview-content-btn').hide();
	}
}