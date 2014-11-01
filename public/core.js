function addElement(array, elem, index) {
	// ensure uniqueness
	if (array.indexOf(elem) > 0) {
		return;
	}
	if (index && index < rows.length) {
		array.splice(index, 0, elem);
	} else {
		array.push(elem);
	}
	console.log('"%s" added, and the new array is now %s', elem, array.join());
}

function removeElement(array, elem) {
	// Should not remove the last element
	if (array.length === 1) {
		return;
	}
	if (array.indexOf(elem) >= 0) {
		array.splice(array.indexOf(elem), 1);
	}
	
	console.log('"%s" removed, and the new array is now %s', elem, array.join());
}

function moveElement(array, elem, offset) {
	var location = array.indexOf(elem);
	if (location < 0) {
		// element does not exist
		return;
	}
	
	var newLocation = location + offset;
	if (newLocation < 0 || newLocation > array.length - 1) {
		// cannot move to a non-existing location
		return;
	}
	
	array.splice(location, 1);
	array.splice(newLocation, 0, elem);
	console.log('"%s" moved with offset %d, and the new array is now %s', elem, offset, array.join());
}
