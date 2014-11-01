var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MatrixSchema = new Schema({
	name: String,
	rows: [String],
	columns: [String]
});

module.exports = mongoose.model('Matrix', MatrixSchema);