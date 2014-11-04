var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContentSchema = new Schema({
	matrix_id: { type: Schema.Types.ObjectId, ref: 'Matrix' },
	row: Number,
	column: Number,
	content: String
});

module.exports = mongoose.model('Content', ContentSchema);