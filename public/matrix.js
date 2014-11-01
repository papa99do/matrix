var currentMatrix; 

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

function hasContent(row, column) {
	return !!(contentMap[row] && contentMap[row][column]);
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
				contentId: matrixData.contentMap[row] && matrixData.contentMap[row][column]
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
	return '<button id="editMatrixBtn" class="btn btn-primary" onclick="editMatrix()">Edit</button>\
	        <button class="matrix-edit btn btn-primary" onclick="saveMatrix()">Save</button>';
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
	var template = '<a href="#" onclick="showContent(';
	template += "'" + data.row + "', '" + data.col + "'";
	if (data.contentId) template += ", '" + data.contentId + "'";
	template += ')"><i class="glyphicon ' + style + '"></i></a>';
	
	return template;
}

function editMatrix() {
	$('.matrix-edit').show();
	$('#editMatrixBtn').hide();
}

function hideMatrixEditor() {
	$('.matrix-edit').hide();
	$('#editMatrixBtn').show();
}

function saveMatrix() {
	$.post('/api/matrixes/' + currentMatrix.name, currentMatrix)
		.done(function(data) {newAlert('success', 'Matrix ' + currentMatrix.name + ' saved!');})
		.fail(function(err) {newAlert('danger', '<strong>ERROR!</strong>'); console.log(err);})
		.always(function() {hideMatrixEditor();});
}


function newAlert(type, message) {
    $("#alert-area").append($("<div class='alert alert-" + type + " fade in' data-alert><p> " + message + " </p></div>"));
    $(".alert").delay(2000).fadeOut("slow", function () { $(this).remove(); });
}


function renderMatrix() {
	
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
}

function generateContentMap(contents) {
	var map = [];
	$(contents).each(function(index, content) {
		if (!map[content.row]) map[content.row] = [];
		map[content.row][content.column] = content._id;
	});
	return map;
}

function getMatrixName() {
	return 'polyglot-coder';
}

$(document).ready(function() {
	$.get('/api/matrixes/' + getMatrixName(), function(data) {
		currentMatrix = data;
		currentMatrix.contentMap = generateContentMap(data.contents);
		console.log(currentMatrix);
		renderMatrix();
		hideMatrixEditor();
	});
});