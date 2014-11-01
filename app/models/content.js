var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContentSchema = new Schema({
	matrix_id: { type: Schema.Types.ObjectId, ref:'Matrix' },
	row: String,
	column: String,
	content: String
});

module.exports = mongoose.model('Content', ContentSchema);