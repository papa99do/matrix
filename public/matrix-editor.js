var matrixEditor = (function($, matrixManager){

var currentMatrix;	// currentMatrix
var oldMatrix;
var MQ = $({}); // simple mq
var lastPopup;

function indexOf(array, id) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].id === id) return i;
	}
	return -1;
}

function addAfter(array, id, newElem) {
	// ensure uniqueness of id
	if (indexOf(array, newElem.id) >= 0) {
		return MQ.trigger('/error/add-duplicate');
	}

	var index = indexOf(array, id) + 1;

	if (index >= 0 && index < array.length) {
		array.splice(index, 0, newElem);
	} else {
		array.push(newElem);
	}

	MQ.trigger('/done/added', newElem);
}

function remove(array, id) {
	if (array.length === 1) {
		return MQ.trigger('/error/remove-last');
	}
	var index = indexOf(array, id);
	if (index >= 0) {
		array.splice(index, 1);
		MQ.trigger('/done/removed');
	}
}

function move(array, id, offset) {
	var index = indexOf(array, id);
	if (index < 0) {
		return;
	}

	var newIndex = index + offset;
	if (newIndex < 0 || newIndex > array.length - 1) {
		// cannot move to a non-existing location
		return MQ.trigger('/error/move-out-of-boundary');
	}

	var elem = array[index];

	array.splice(index, 1);
	array.splice(newIndex, 0, elem);

	MQ.trigger('/done/moved');
}

function edit(array, newElem) {
	var index = indexOf(array, newElem.id);
	if (index >= 0) {
		array[index] = newElem;
		MQ.trigger('/done/edited');
	}
}

function stopPropagation(event) {
	if (event.stopPropagation) {
	  event.stopPropagation();   // W3C model
	} else {
	  event.cancelBubble = true; // IE model
	}
}

function hidePopup(exceptForElem) {
	if (lastPopup && (!exceptForElem || exceptForElem !== lastPopup)) {
		//console.log("hiding popup: ", lastPopup);
		$(lastPopup).popover('hide');
	}
}

var editPopupActionMap = {
	'editRow'		: {title: 'Edit row', callback: 'window.editor.editRow', place: 'right'},
	'addRowAfter'	: {title: 'Add row'	, callback: 'window.editor.addRowAfter', place: 'right'},
	'editColumn'	: {title: 'Edit column', callback: 'window.editor.editColumn', place: 'left'},
	'addColumnAfter': {title: 'Add column', callback: 'window.editor.addColumnAfter', place: 'left'},
}

function showEditPopup(event, elem, id, label, actionName) {
	var contentTemplate = '\
		<div class="input-group">\
		  <span class="input-group-addon">Label</span>\
		  <input type="text" id="edit-label-input" class="form-control" value="{{label}}">\
		  <span class="input-group-btn">\
	      	<button class="btn btn-primary" type="button" onclick="{{action}}({{id}}, $(\'#edit-label-input\').val())">Save</button>\
		  </span>\
		</div>\
	';

	var action = editPopupActionMap[actionName];

	stopPropagation(event);

	hidePopup(elem);

	$(elem).popover({
		html: true,
		trigger: 'manual',
		placement: action.place,
		container: 'body',
		title: action.title,
		content: populate(contentTemplate, {id: id, label:label, action: action.callback})
	}).popover('toggle');

	lastPopup = elem;

	$('.popover').click(function(event) {
		stopPropagation(event);
	});
}

var init = function init(matrix) {
	currentMatrix = matrix;
	hideMatrixEditor();
};

var saveMatrix = function saveMatrix() {
	$.post('/api/matrixes/' + currentMatrix.name, currentMatrix)
		.done(function(matrix) {
			newAlert('success', 'Matrix ' + currentMatrix.name + ' saved!');
			matrixManager.renderMatrix(matrix);
			init(matrix);
		})
		.fail(function(err) {newAlert('danger', '<strong>ERROR!</strong>'); console.error(err)});
};

var editMatrix = function editMatrix() {
	oldMatrix = $.extend(true, {}, currentMatrix);
	showMatrixEditor();
};

var cancelEdit = function cancelEdit() {
	currentMatrix = oldMatrix;
	matrixManager.renderMatrix(currentMatrix);
	hideMatrixEditor();
}

function showMatrixEditor() {
	$('.matrix-edit').show();
	$('.matrix-non-edit').hide();
}

function hideMatrixEditor() {
	$('.matrix-edit').hide();
	$('.matrix-non-edit').show();
}


// register matrix renderers
var firstColumnTitle = function firstColumnTitle(matrix) {
	return '<span id="matrixName">' + matrix.name + '</span>' +
			'<span class="pull-right"> \
			  <button class="matrix-non-edit btn btn-sm btn-primary" onclick="window.editor.editMatrix()">Edit</button>\
			  <button class="matrix-edit btn btn-sm" onclick="window.editor.cancelEdit()">Cancel</button>\
	          <button class="matrix-edit btn btn-sm btn-primary" onclick="window.editor.saveMatrix()">Save</button>\
			</span>';
};

var firstColumnContent = function firstColumnContent(row) {
	var template = ' \
		<span>{{label}}</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" rel onclick="window.editor.showEditPopup(event, this, {{id}}, \'{{label}}\', \'editRow\')"><i class="glyphicon glyphicon-pencil"></i></a> \
		  <a href="#" onclick="window.editor.showEditPopup(event, this, {{id}}, \'\', \'addRowAfter\')"><i class="glyphicon glyphicon-plus"></i></a> \
		  <a href="#" onclick="window.editor.removeRow({{id}})"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="window.editor.moveRowUp({{id}})"><i class="glyphicon glyphicon-chevron-up"></i></a> \
		  <a href="#" onclick="window.editor.moveRowDown({{id}})"><i class="glyphicon glyphicon-chevron-down"></i></a> \
		</span> \
	';
	return populate(template, row);
};

var contentColumnTitle = function contentColumnTitle(column) {
	var template = ' \
		<span>{{label}}</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" onclick="window.editor.showEditPopup(event, this, {{id}}, \'{{label}}\', \'editColumn\')"><i class="glyphicon glyphicon-pencil"></i></a> \
		  <a href="#" onclick="window.editor.showEditPopup(event, this, {{id}}, \'\', \'addColumnAfter\')"><i class="glyphicon glyphicon-plus"></i></a> \
		  <a href="#" onclick="window.editor.removeColumn({{id}})"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="window.editor.moveColumnLeft({{id}})"><i class="glyphicon glyphicon-chevron-left"></i></a> \
		  <a href="#" onclick="window.editor.moveColumnRight({{id}})"><i class="glyphicon glyphicon-chevron-right"></i></a> \
		</span> \
	';
	return populate(template, column);
};

matrixManager.registerRenderers({
	firstColumnTitle: firstColumnTitle,
	firstColumnContent: firstColumnContent,
	contentColumnTitle: contentColumnTitle
});


// bind event handlers
MQ.on('/done/added /done/edited', function() {
	hidePopup();
});

MQ.on('/done/added /done/moved /done/removed /done/edited', function() {
	matrixManager.renderMatrix(currentMatrix);
	showMatrixEditor();
});

$(document).click(function() {
	hidePopup();
});

return {
	init: init,
	saveMatrix: saveMatrix,
	editMatrix: editMatrix,
	cancelEdit: cancelEdit,
	showEditPopup: showEditPopup,

	addRowAfter	: function(id, label) {addAfter(currentMatrix.rows, id, {id: currentMatrix.nextRowId++, label: label}); },
	editRow		: function(id, label) {edit(currentMatrix.rows, {id: id, label: label})},
	removeRow	: function(id) {remove(currentMatrix.rows, id); },
	moveRowUp	: function(id) {move(currentMatrix.rows, id, -1); },
	moveRowDown	: function(id) {move(currentMatrix.rows, id, 1); },

	addColumnAfter	: function(id, label) {addAfter(currentMatrix.columns, id, {id: currentMatrix.nextColumnId++, label: label}); },
	editColumn		: function(id, label) {edit(currentMatrix.columns, {id: id, label: label})},
	removeColumn	: function(id) {remove(currentMatrix.columns, id); },
	moveColumnLeft	: function(id) {move(currentMatrix.columns, id, -1); },
	moveColumnRight	: function(id) {move(currentMatrix.columns, id, 1); }

};

})(jQuery, matrixManager);

var editor = matrixEditor;
