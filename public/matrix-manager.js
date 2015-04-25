function newAlert(type, message) {
	var alertHtml = '<div class="alert alert-{{type}} fade in" data-alert><p>{{message}}</p></div>';
	$("#alert-area").append($(populate(alertHtml, {type: type, message: message})));
    $(".alert").delay(2000).fadeOut("slow", function () { $(this).remove(); });
}

function populate(template, params) {
	return template.replace(/\{\{(\w+)\}\}/g, function(match, name){return params[name];});
}


var matrixManager = (function matrixManager($) {

var DEFAULT_ROW_TYPE = 'md';
var currentMatrix;
var contentMap;
var contentPlugins = {};
var	columnTypes = {};
var sharedHtmls = '';

// By default, we have read only renderers
var renderers = {
	firstColumnTitle: function(matrix) {return matrix.name;},
	firstColumnContent: function(row) {return row.label;},
	contentColumnTitle: function(column) {return column.label;}
};

var getFullContent = function getFullContent(contentId, callback) {
	$.get('/api/contents/' + contentId, function(data) {callback(data);});
};

var saveContent = function saveContent(content, doneCallback, failCallback) {
	if (currentMatrix.__v === undefined) {
		return newAlert('danger', '<strong>ERROR!</strong> Please save the matrix first!');
	}

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

var registerRenderers = function registerRenderers(otherRenders) {
	renderers = otherRenders;
}

var init = function init(matrix, contents) {
	$('body').append(sharedHtmls);
	createContentMap(contents);
	renderMatrix(matrix);
}

function getElemById(array, id) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].id === id) return array[i];
	}
	return {};
}

function changeContent(content) {
	setContent(content);
	reRender(content);
}

function reRender(content) {
	$(populate('#content-{{rowId}}-{{columnId}}', content)).parent().html(renderContent(content));
}

function renderContent(content) {
	var hookInput = populate('<input type="hidden" id="content-{{rowId}}-{{columnId}}">', content);
	var rowType = getElemById(currentMatrix.rows, content.rowId).rowType || DEFAULT_ROW_TYPE;
	return hookInput + contentPlugins[rowType].renderContent(content);
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

var renderMatrix = function renderMatrix(matrix) {

	currentMatrix = matrix;

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
		title: renderers.firstColumnTitle(currentMatrix),
		render: renderers.firstColumnContent,
		class: 'label-column'
	});

	$(currentMatrix.columns).each(function(i, column) {
		columns.push({
			title: renderers.contentColumnTitle(column),
			render: renderContent,
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
	getColumnLabel: function(columnId) {return getElemById(currentMatrix.columns, columnId).label || '';},
	getRowLabel: function(rowId) {return getElemById(currentMatrix.rows, rowId).label || '';},
	getContent: getContent,
	getFullContent: getFullContent,
	saveContent: saveContent,
	registerPlugin: registerPlugin,
	registerRenderers: registerRenderers,
	contentPlugins: contentPlugins,
	init: init,
	renderMatrix: renderMatrix
};


})(jQuery);

var plugins = matrixManager.contentPlugins;
