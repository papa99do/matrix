// set up ========================
var express  = require('express');
var app      = express(); 								// create our app w/ express
var mongoose = require('mongoose'); 					// mongoose for mongodb
var morgan = require('morgan'); 			// log requests to the console (express4)
var bodyParser = require('body-parser'); 	// pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var Matrix     = require('./app/models/matrix');
var Content    = require('./app/models/content');

// configuration =================
var mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/matrix';

mongoose.connect(mongoUrl);
mongoose.set('debug', true)

app.use(express.static(__dirname + '/public')); 				// set the static files location /public/img will be /img for users
app.use(morgan('dev')); 										// log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

function handleError(err, res) {
	console.error(err);
	res.send(err);
}

function handleResult(result, res) {
	console.log(result);
	res.json(result);
}

// configuration of the router
var router = express.Router();

router.route('/matrixes')
.get(function(req, res) {
	Matrix.find().select('-_id name').exec(function(err, matrixes) {
		if (err) return handleError(err, res);
		handleResult(matrixes, res);
	});
});

router.route('/matrixes/:name')
.get(function(req, res) {
	var matrixName = req.params.name;

	console.log('Getting matrix: ' + matrixName);

	Matrix.findOne({name: matrixName}, function(err, matrix) {
		if (err) return handleError(err, res);

		if (!matrix) {
			matrix = new Matrix({name: matrixName});
			handleResult({matrix: matrix, contents: []}, res);
		} else {
			Content.find({matrixId: matrix._id}).select('rowId columnId content').exec(function(err, contents) {
				if (err) return handleError(err, res);
				handleResult({matrix: matrix, contents: contents}, res);
			});
		}
	});
})
.post(function(req, res) {
	console.log('Saving matrix: ', req.body);

	Matrix.findOne({name: req.params.name}, function(err, matrix) {
		if (err) return handleError(err, res);

		if (!matrix) {
			matrix = new Matrix(req.body);
		} else {
			matrix.rows = req.body.rows;
			matrix.columns = req.body.columns;
			matrix.nextRowId = req.body.nextRowId;
			matrix.nextColumnId = req.body.nextColumnId;
		}

		matrix.save(function(err, savedMatrix) {
			if(err) return handleError(err, res);
			handleResult(savedMatrix, res);
		});
	});
});

router.route('/contents/:id')
.get(function(req, res) {
	Content.findById(req.params.id, function(err, content) {
		if (err) return handleError(err, res);
		handleResult(content, res);
	});
})
.post(function(req, res) {
	Content.findById(req.params.id, function(err, content) {
		if (err) return handleError(err, res);

		content.content = req.body.content;
		content.fullContent = req.body.fullContent;

		content.save(function(err, savedContent) {
			if(err) return handleError(err, res);
			handleResult(savedContent, res);
		});
	});
});

router.route('/contents')
.post(function(req, res) {
	console.log('Saving content: ', req.body);

	var content = new Content({
		matrixId: req.body.matrixId,
		rowId: req.body.rowId,
		columnId: req.body.columnId,
		content: req.body.content,
		fullContent: req.body.fullContent
	});

	content.save(function(err, savedContent) {
		if(err) return handleError(err, res);
		handleResult(savedContent, res);
	});
});

app.use('/api', router);

app.get('*', function(req, res) {
	res.sendfile('public/index.html');
});


// listen (start app with node server.js) ======================================
var port = process.env.PORT || 3002;
app.listen(port);
console.log("App listening on port " + port);
