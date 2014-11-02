var currentMatrix, contentMap;
var oldMatrix; 

function addRow(rowLabel, index) {
	addElement(currentMatrix.rows, rowLabel, index);
	renderMatrix();
}

function addColumn(columnLabel, index) {
	addElement(currentMatrix.columns, columnLabel, index);
	renderMatrix();
}

function removeRow(rowLabel) {
	removeElement(currentMatrix.rows, rowLabel);
	renderMatrix();
}

function removeColumn(columnLabel) {
	removeElement(currentMatrix.columns, columnLabel);
	renderMatrix();
}

function moveRowUp(label) {
	moveElement(currentMatrix.rows, label, -1);
	renderMatrix();
}

function moveRowDown(label) {
	moveElement(currentMatrix.rows, label, 1);
	renderMatrix();
}

function moveColumnLeft(label) {
	moveElement(currentMatrix.columns, label, -1);
	renderMatrix();
}

function moveColumnRight(label) {
	moveElement(currentMatrix.columns, label, 1);
	renderMatrix();
}

function createMatrixTable(matrixData) {
	var matrix = {header: [], data: []};
	$(matrixData.columns).each(function(i, col) {matrix.header.push(col);});
	$(matrixData.rows).each(function(i, row) {
		var rowData = [row];
		$(matrixData.columns).each(function(j, col) {
			rowData.push({
				row: row, 
				col: col, 
				contentId: contentMap[row] && contentMap[row][col]
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

function contentColumnHeader(columnLabel) {
	var template = ' \
		<span>$columnLabel</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" onclick="removeColumn(\'$columnLabel\')"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="moveColumnLeft(\'$columnLabel\')"><i class="glyphicon glyphicon-chevron-left"></i></a> \
		  <a href="#" onclick="moveColumnRight(\'$columnLabel\')"><i class="glyphicon glyphicon-chevron-right"></i></a> \
		</span> \
	';
	return template.replace(/\$columnLabel/g, columnLabel);
}

function labelColumn(rowLabel) {
	var template = ' \
		<span>$rowLabel</span> \
		<span class="matrix-edit pull-right"> \
		  <a href="#" onclick="removeRow(\'$rowLabel\')"><i class="glyphicon glyphicon-minus"></i></a> \
		  <a href="#" onclick="moveRowUp(\'$rowLabel\')"><i class="glyphicon glyphicon-chevron-up"></i></a> \
		  <a href="#" onclick="moveRowDown(\'$rowLabel\')"><i class="glyphicon glyphicon-chevron-down"></i></a> \
		</span> \
	';
	
	return template.replace(/\$rowLabel/g, rowLabel);
}

function contentColumn(data) {
	var style = data.contentId ? 'glyphicon-star' : 'glyphicon-star-empty';
	var template = '<a class="content-link" href="#" onclick="showContent(this, ';
	template += "'" + data.row + "', '" + data.col + "'";
	if (data.contentId) template += ", '" + data.contentId + "'";
	template += ')"><i class="glyphicon ' + style + '"></i></a>';
	
	return template;
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
		.done(function(data) {newAlert('success', 'Matrix ' + currentMatrix.name + ' saved!');})
		.fail(function(err) {newAlert('danger', '<strong>ERROR!</strong>'); console.log(err);})
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
		if (!map[content.row]) map[content.row] = {};
		map[content.row][content.column] = content._id;
	});
	return map;
}

function getMatrixName() {
	return 'polyglot-coder';
}

$(document).ready(function() {
	$.get('/api/matrixes/' + getMatrixName(), function(data) {
		console.log(data);
		currentMatrix = data.matrix;
		contentMap = generateContentMap(data.contents);
		renderMatrix({readOnly: true});
	});
});