var express = require('express'),
	app = express();

app.configure(function(){
	app.use(express.static(__dirname + '/'));
});

// now start the server
var server = app.listen(5000, function(){
	console.log('Server up and running on port %d', server.address().port);
});