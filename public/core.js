function indexOf(array, id) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].id === id) return i;
	}
	return -1;
}

function getLabelById(array, id) {
	var index = indexOf(array, id);
	return index < 0 ? '' : array[index].label;
}

function addElement(array, label, id, index) {	
	// ensure uniqueness of id
	if (indexOf(array, id) >= 0) {
		return 0;
	}
	
	var elem = {id: id, label: label};
	
	if (index >= 0 && index < array.length) {
		array.splice(index, 0, elem);
	} else {
		array.push(elem);
	}
	
	return 1;
}

function removeElement(array, id) {
	var index = indexOf(array, id);
	if (index >= 0) array.splice(index, 1);
}

function moveElement(array, id, offset) {
	var index = indexOf(array, id);
	if (index < 0) {
		// element does not exist
		return;
	}
	
	var newIndex = index + offset;
	if (newIndex < 0 || newIndex > array.length - 1) {
		// cannot move to a non-existing location
		return;
	}
	
	var elem = array[index];
	
	array.splice(index, 1);
	array.splice(newIndex, 0, elem);
}

function changeElement(array, id, label) {
	var index = indexOf(array, id);
	if (index >= 0) array[index].label = label;
}

function newAlert(type, message) {
    $("#alert-area").append($("<div class='alert alert-" + type + " fade in' data-alert><p> " + message + " </p></div>"));
    $(".alert").delay(2000).fadeOut("slow", function () { $(this).remove(); });
}

function stopPropagation(event) {
	if (event.stopPropagation) {
	    event.stopPropagation();   // W3C model
	} else {
	    event.cancelBubble = true; // IE model
	}
}
