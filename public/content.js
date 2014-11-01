var currentContent;
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
			currentContent = data;
			show(row, col, data.content);
		});
	} else {
		currentContent = {row: row, column: col, matrix_id: currentMatrix._id};
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
	currentContent.content = $('#content-markdown').val();
	var url = '/api/contents';
	if (currentContent._id) {
		url = url + '/' + currentContent._id; 
	}
	
	$.post(url, currentContent)
	.done(function(content) {
		
		if (!currentContent._id) {
			updateContentMap(content);
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
	if (!contentMap[content.row]) contentMap[content.row] = {};
	contentMap[content.row][content.column] = content._id;
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