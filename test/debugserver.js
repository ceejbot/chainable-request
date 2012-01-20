var express = require('express');
var querystring = require('querystring');

var app = express.createServer();
app.use(express.bodyParser());

app.get('/chainabletest', function(req, res)
{
	console.log('--- get');
	res.send('we got your get: '+querystring.stringify(req.query));
});

app.get('/chunkedtest', function(req, res)
{
	// TODO write response chunked
	console.log('--- get');
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
		console.log('--- post');
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
		console.log('--- put');
		res.send('you shot a put: '+data.toString());
	});
});

app.delete('/chainabletest', function(req, res)
{
	console.log('--- del');
	console.log(req.headers);
	console.log(req.params);
    res.send('you have been deleted');
});

app.get('*', function(req, res)
{
	console.log(req.url);
	res.send('SPLAT');
});

app.listen(3009, 'localhost');
console.log("now listening on port 3009");