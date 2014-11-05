var currentMatrix, contentMap;
var oldMatrix; 
var lastPopup;

function addRow(rowLabel, index) {
	var result = addElement(currentMatrix.rows, rowLabel, currentMatrix.nextRowId++, index);
	if (result === 0) newAlert('danger', 'Error when adding this row, please try again'); 
	renderMatrix();
}

function addAfterRow(rowId, newRowLabel) {
	console.log(rowId, newRowLabel);
	
	if (!rowId || !newRowLabel) return;
	var index = indexOf(currentMatrix.rows, rowId);
	var result = addElement(currentMatrix.rows, newRowLabel, currentMatrix.nextRowId++, index + 1);
	if (result === 0) newAlert('danger', 'Error when adding this row, please try again'); 
	if (lastPopup) $(lastPopup).popover('hide');
	
	renderMatrix();
}

function addColumn(columnLabel, index) {
	var result = addElement(currentMatrix.columns, columnLabel, currentMatrix.nextColumnId++, index);
	if (result === 0) newAlert('danger', 'Error when adding this column, please try again');
	renderMatrix();
}

function addAfterColumn(columnId, newColumnLabel) {
	console.log(columnId, newColumnLabel);
	
	if (!columnId || !newColumnLabel) return;
	var index = indexOf(currentMatrix.columns, columnId);
	var result = addElement(currentMatrix.columns, newColumnLabel, currentMatrix.nextColumnId++, index + 1);
	if (lastPopup) $(lastPopup).popover('hide');
	
	if (result === 0) newAlert('danger', 'Error when adding this column, please try again');
	renderMatrix();
}

function removeRow(rowId) {
	if (currentMatrix.rows.length === 1) {
		newAlert('danger', 'Cannot remove the last row!');
		return;
	}
	removeElement(currentMatrix.rows, rowId);
	renderMatrix();
}

function removeColumn(columnId) {
	if (currentMatrix.columns.length === 1) {
		newAlert('danger', 'Cannot remove the last column!');
		return;
	}
	removeElement(currentMatrix.columns, columnId);
	renderMatrix();
}

function moveRowUp(rowId) {
	moveElement(currentMatrix.rows, rowId, -1);
	renderMatrix();
}

function moveRowDown(rowId) {
	moveElement(currentMatrix.rows, rowId, 1);
	renderMatrix();
}

function moveColumnLeft(columnId) {
	moveElement(currentMatrix.columns, columnId, -1);
	renderMatrix();
}

function moveColumnRight(columnId) {
	moveElement(currentMatrix.columns, columnId, 1);
	renderMatrix();
}

function renameRow(rowId, newLabel) {
	changeElement(currentMatrix.rows, rowId, newLabel);
	if (lastPopup) $(lastPopup).popover('hide');
	renderMatrix();
}

function renameColumn(columnId, newLabel) {
	changeElement(currentMatrix.columns, columnId, newLabel);
	if (lastPopup) $(lastPopup).popover('hide');
	renderMatrix();
}

function createMatrixTable(matrixData) {
	var matrix = {header: [], data: []};
	$(matrixData.columns).each(function(i, col) {matrix.header.push(col);});
	$(matrixData.rows).each(function(i, row) {
		var rowData = [row];
		$(matrixData.columns).each(function(j, col) {
			rowData.push({
				rowId: row.id, 
				colId: col.id, 
				contentId: contentMap[row.id] && contentMap[row.id][col.id]
			});
		});
		matrix.data.push(rowData);
	});
	
	//console.log(matrix);
	return matrix;
}

function getColumnConfig(header) {
	var columns = [];
	// first Column
	columns.push({
		title: labelColumnHeader(),
		render: labelColumn,
		class: 'label-column'
	});
	$(header).each(function(i, columnLabel) {
		columns.push({
			title: contentColumnHeader(columnLabel),
			render: contentColumn,
			class: 'content-column'
		});
	});
	//console.log(columns);
	return columns;
}

function labelColumnHeader() {
	return '<span id="matrixName">' +currentMatrix.name + '</span>' +
			'<span class="pull-right"> \
			  <button class="matrix-non-edit btn btn-sm btn-primary" onclick="editMatrix()">Edit</button>\
			  <button class="matrix-edit btn btn-sm" onclick="cancelEdit()">Cancel</button>\
	          <button class="matrix-edit btn btn-sm btn-primary" onclick="saveMatrix()">Save</button>\
			</span>';
}

function contentColumnHeader(column) {
	var template = ' \
		<span>$columnLabel</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" onclick="editColumn(event, this, $columnId, \'$columnLabel\')"><i class="glyphicon glyphicon-pencil"></i></a> \
		  <a href="#" onclick="newColumnAfter(event, this, $columnId)"><i class="glyphicon glyphicon-plus"></i></a> \
		  <a href="#" onclick="removeColumn($columnId)"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="moveColumnLeft($columnId)"><i class="glyphicon glyphicon-chevron-left"></i></a> \
		  <a href="#" onclick="moveColumnRight($columnId)"><i class="glyphicon glyphicon-chevron-right"></i></a> \
		</span> \
	';
	return template.replace(/\$columnLabel/g, column.label).replace(/\$columnId/g, column.id);
}

function labelColumn(row) {
	var template = ' \
		<span>$rowLabel</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" rel onclick="editRow(event, this, $rowId, \'$rowLabel\')"><i class="glyphicon glyphicon-pencil"></i></a> \
		  <a href="#" onclick="newRowAfter(event, this, $rowId)"><i class="glyphicon glyphicon-plus"></i></a> \
		  <a href="#" onclick="removeRow($rowId)"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="moveRowUp($rowId)"><i class="glyphicon glyphicon-chevron-up"></i></a> \
		  <a href="#" onclick="moveRowDown($rowId)"><i class="glyphicon glyphicon-chevron-down"></i></a> \
		</span> \
	';
	
	return template.replace(/\$rowLabel/g, row.label).replace(/\$rowId/g, row.id);
}

function contentColumn(data) {
	var style = data.contentId ? 'glyphicon-star' : 'glyphicon-star-empty';
	var template = '<a class="content-link" href="#" onclick="showContent(this, ';
	template += data.rowId + ", " + data.colId;
	if (data.contentId) template += ", '" + data.contentId + "'";
	template += ')"><i class="glyphicon ' + style + '"></i></a>';
	
	return template;
}

function editRow(event, elem, rowId, rowLabel) {
	stopPropagation(event);
	
	if (lastPopup && elem !== lastPopup) $(lastPopup).popover('hide');
	
	$(elem).popover({
		html: true,
		trigger: 'focus',
		placement: 'right',
		container: 'body',
		title: $("#edit-row-popover-head").html(),
		content: $("#edit-row-popover-content").html().replace(/\$rowId/g, rowId).replace(/\$rowLabel/g, rowLabel)
	}).popover('toggle');
	
	lastPopup = elem;
	
	$('.popover').click(function(event) {
		stopPropagation(event);
	});
}

function newRowAfter(event, elem, rowId) {
	stopPropagation(event);
	
	if (lastPopup && elem !== lastPopup) $(lastPopup).popover('hide');
	
	$(elem).popover({
		html: true,
		trigger: 'focus',
		placement: 'right',
		container: 'body',
		title: $("#add-row-popover-head").html(),
		content: $("#add-row-popover-content").html().replace(/\$rowId/g, rowId)
	}).popover('toggle');
	
	lastPopup = elem;
	
	$('.popover').click(function(event) {
		stopPropagation(event);
	});
}

function editColumn(event, elem, columnId, columnLabel) {
	stopPropagation(event);
	
	if (lastPopup && elem !== lastPopup) $(lastPopup).popover('hide');
	
	$(elem).popover({
		html: true,
		trigger: 'focus',
		placement: 'left',
		container: 'body',
		title: $("#edit-column-popover-head").html(),
		content: $("#edit-column-popover-content").html().replace(/\$columnId/g, columnId).replace(/\$columnLabel/g, columnLabel)
	}).popover('toggle');
	
	lastPopup = elem;
	
	$('.popover').click(function(event) {
		stopPropagation(event);
	});
}

function newColumnAfter(event, elem, columnId) {
	stopPropagation(event);
	
	if (lastPopup && elem !== lastPopup) $(lastPopup).popover('hide');
	
	$(elem).popover({
		html: true,
		trigger: 'focus',
		placement: 'left',
		container: 'body',
		title: $("#add-column-popover-head").html(),
		content: $("#add-column-popover-content").html().replace(/\$columnId/g, columnId)
	}).popover('toggle');
	
	lastPopup = elem;
	
	$('.popover').click(function(event) {
		stopPropagation(event);
	});
}

function editMatrix() {
	oldMatrix = $.extend(true, {}, currentMatrix);
	$('.matrix-edit').show();
	$('.matrix-non-edit').hide();
}

function hideEditButton() {
	$('.matrix-non-edit').hide();
}

function hideMatrixEditor() {
	$('.matrix-edit').hide();
	$('.matrix-non-edit').show();
}

function cancelEdit() {
	currentMatrix = oldMatrix;
	renderMatrix({readOnly: true});
}

function saveMatrix() {
	$.post('/api/matrixes/' + currentMatrix.name, currentMatrix)
		.done(function() {newAlert('success', 'Matrix ' + currentMatrix.name + ' saved!');})
		.fail(function(err) {newAlert('danger', '<strong>ERROR!</strong>'); console.error(err)})
		.always(function() {hideMatrixEditor();});
}

function renderMatrix(option) {
	
	var matrix = createMatrixTable(currentMatrix);
	
	$('#matrix-container').html('<table id="matrix" class="display cell-border"></table>');
	
	var table =  $('#matrix').dataTable( {
	        data: matrix.data,
	        columns: getColumnConfig(matrix.header),
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
	
	if (option && option.readOnly) {
		hideMatrixEditor();
	} else {
		hideEditButton();
	}
}

function generateContentMap(contents) {
	var map = {};
	$(contents).each(function(index, content) {
		if (!map[content.rowId]) map[content.rowId] = {};
		map[content.rowId][content.columnId] = content._id;
	});
	return map;
}

function getMatrixName() {
	return location.pathname.slice(1) || 'polyglot-coder';
}

$(document).ready(function() {
	$.get('/api/matrixes/' + getMatrixName(), function(data) {
		console.log(data);
		currentMatrix = data.matrix;
		contentMap = generateContentMap(data.contents);
		renderMatrix({readOnly: true});
	});
});

$(document).click(function() {
	if (lastPopup) $(lastPopup).popover('hide');
});