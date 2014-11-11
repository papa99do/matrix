var matrixManager = (function matrixManager($) {
	
var DEFAULT_COLUMN_TYPE = 'md';
var currentMatrix;
var contentMap;
var contentPlugins = {};
var	columnTypes = {};
var sharedHtmls = '';

var getFullContent = function getFullContent(contentId, callback) {
	$.get('/api/contents/' + contentId, function(data) {callback(data);});
};

var saveContent = function saveContent(content, doneCallback, failCallback) {
		
	var url = '/api/contents';
	if (content._id) url = url + '/' + content._id; 
	if (!content.matrixId) content.matrixId = currentMatrix._id;
	
	$.post(url, content)
	.done(function(content) {
		changeContent(content);
		newAlert('success', 'Content saved!');
		doneCallback && doneCallback();
	})
	.fail(function(err) {
		newAlert('danger', '<strong>ERROR!</strong> Cannot save content!');
		console.error(err);
		failCallback && failCallback();
	});
};

var registerPlugin = function registerPlugin(plugin) {
	if (contentPlugins[plugin.name]) {
		console.error('Cannot register duplicate plugin: ', plugin.displayName);
		return;
	}
	
	contentPlugins[plugin.name] = plugin;
	columnTypes[plugin.name] = plugin.displayName;
	
	if (plugin.sharedHtml) {
		sharedHtmls = sharedHtmls + plugin.sharedHtml;
	}
};

var getColumnLabel = function getColumnLabel(columnId) {
	return getElemById(currentMatrix.columns, columnId).label;
};

var getRowLabel = function getRowLabel(rowId) {
	return getElemById(currentMatrix.rows, rowId).label;
};

var init = function init(matrix, contents) {
	$('body').append(sharedHtmls);
	currentMatrix = matrix;
	createContentMap(contents);
	renderMatrix();
}

function changeContent(content) {
	setContent(content);
	reRender(content);
}

function reRender(content) {
	$(populate('#content-{{rowId}}-{{columnId}}', content)).parent().html(render(content));
}

function render(content) {
	var hookInput = populate('<input type="hidden" id="content-{{rowId}}-{{columnId}}">', content);
	var columnType = getElemById(currentMatrix.columns, content.columnId).type || DEFAULT_COLUMN_TYPE;
	return hookInput + contentPlugins[columnType].renderContent(content);
}

function setContent(content) {
	if (!contentMap[content.rowId]) contentMap[content.rowId] = {};
	contentMap[content.rowId][content.columnId] = content;
};

var getContent = function getContent(rowId, columnId) {
	return contentMap[rowId] && contentMap[rowId][columnId] 
			|| {rowId: rowId, columnId: columnId, content: ''};
}
	
function createContentMap(contents) {
	contentMap = {};
	$(contents).each(function(index, content) {setContent(content)});
};

function renderMatrix() {
	
	$('#matrix-container').html('<table id="matrix" class="display cell-border"></table>');
	
	var table =  $('#matrix').dataTable( {
	        data: getMatrixData(),
	        columns: getColumnConfig(),
			scrollY: '500px',
			scrollX: '100%',
			scrollCollapse: true,
			paging: false,
			info: false,
			ordering: false,
			searching: false,
			destroy: true,
			autoWidth: false
	    } );
	new $.fn.dataTable.FixedColumns( table );
}

function getColumnConfig() {
	var columns = [];
	// first Column
	columns.push({
		title: currentMatrix.name,
		render: function(data) {return data.label;},
		class: 'label-column'
	});
	
	$(currentMatrix.columns).each(function(i, column) {
		columns.push({
			title: column.label,
			render: render,
			class: 'content-column'
		});
	});
	//console.log(columns);
	return columns;
	
}

function getMatrixData() {
	var data = [];
	$(currentMatrix.rows).each(function(i, row) {
		var rowData = [row];
		$(currentMatrix.columns).each(function(j, column) {
			rowData.push(getContent(row.id, column.id));
		});
		data.push(rowData);
	});
	return data;
}

return {
	getColumnLabel: getColumnLabel,
	getRowLabel: getColumnLabel,
	getContent: getContent,
	getFullContent: getFullContent,
	saveContent: saveContent,
	registerPlugin: registerPlugin,
	contentPlugins: contentPlugins,
	init: init
};
	

})(jQuery);

var plugins = matrixManager.contentPlugins;