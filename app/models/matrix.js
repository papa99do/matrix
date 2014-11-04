var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MatrixSchema = new Schema({
	name: String,
	rows: { type: [{id: Number, label: String, _id:false}], default: [{id: 1, label:'first row'}] },
	columns: { type: [{id: Number, label: String, _id:false}], default: [{id: 1, label:'first column'}] },
	nextRowId: { type: Number, default: 2 },
	nextColumnId: { type: Number, default: 2 }
});

module.exports = mongoose.model('Matrix', MatrixSchema);