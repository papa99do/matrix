var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContentSchema = new Schema({
	matrixId: { type: Schema.Types.ObjectId, ref: 'Matrix' },
	rowId: Number,
	columnId: Number,
	content: String
});

module.exports = mongoose.model('Content', ContentSchema);