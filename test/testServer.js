var express     = require('express'),
    connectAuth = require('connect-auth'),
    querystring = require('querystring'),
    fs          = require('fs');

// For testing basic auth.
var passwordValidator = function(user, password, winCallback, failCallback)
{
	// Everybody has the same password!
	if (password === 'hideouslyInsecure')
		winCallback();
	else
		failCallback();
};

// var app = express.createServer(
//	connectAuth({ strategies: [ connectAuth.Basic({validatePassword: passwordValidator}) ]})
//);

var app = express.createServer();
app.use(express.bodyParser());

app.get('/authenticate-me', function(req, res)
{
	req.authenticate(['basic'], function(error, authenticated)
	{ 
		console.log(JSON.stringify(error)); 
		console.log(JSON.stringify(authenticated));
    });
});

app.get('/chainabletest', function(req, res)
{
	console.log('--- get /chainabletest');
	res.send('we got your get: '+querystring.stringify(req.query));
});

app.get('/chunkedtest', function(req, res)
{
	// TODO write response chunked
	console.log('--- get /chunkedtest');
	res.send('we got your get: '+querystring.stringify(req.query));
});

app.post('/chainabletest', function(req, res)
{
	var size = parseInt(req.headers['content-length']);
	var data = new Buffer(size);
	var buffptr = 0;
	
	req.on('data', function(chunk)
	{
		chunk.copy(data, buffptr);
		buffptr += chunk.length;
	});
	
	req.on('end', function()
	{
		console.log('--- post /chainabletest');
		//console.log(req.headers);
		//console.log(req.params);
		//console.log(req.body);
		res.send('you posted a post: '+data.toString());
	});
});

app.put('/chainabletest', function(req, res)
{
	var size = parseInt(req.headers['content-length']);
	var data = new Buffer(size);
	var buffptr = 0;
	
	req.on('data', function(chunk)
	{
		chunk.copy(data, buffptr);
		buffptr += chunk.length;
	});
	
	req.on('end', function()
	{
		console.log('--- put /chainabletest');
		res.send('you shot a put: '+data.toString());
	});
});

app.delete('/chainabletest', function(req, res)
{
	console.log('--- del /chainabletest');
	console.log(req.headers);
	console.log(req.params);
    res.send('you have been deleted');
});

app.get('/cat.gif', function(req, res)
{
	fs.readFile('cat.gif', 'binary', function(err, data)
	{
		res.header('Content-Type', 'image/gif');
		res.end(data, 'binary');
	});
});

app.get('*', function(req, res)
{
	console.log(req.url);
	res.send('SPLAT');
});

app.listen(3009, 'localhost');
console.log("now listening on port 3009");