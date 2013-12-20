module.exports = function(express, app) {

	// API
	app.get('/api/roles', function(req, res) {
		console.log("Here in get roles");
		res.end();
	});

	// Application
	app.use("/", express.static(__dirname + "/../client"));
}