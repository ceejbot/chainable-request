var 
	requester = require('../chainable-request.js').chainableRequest,
	url       = require('url'),
	fs = require('fs');

imgurl = 'http://localhost:3009/cat.gif';
function fetchImage(imgurl, callback)
{
	var uri = url.parse(imgurl);
	
	new requester(uri).
		headers({ 'user-agent': 'chainable-request 0.0.1' }).
		get().
		on('reply', function(response, body)
	{
		var mimetype = response.headers['content-type'];		
		callback(mimetype, body);
	}).
		on('error', function(err)
	{
		console.log('error in the image fetch test');
		console.log(err);
	});	
}

fetchImage(imgurl, function(mimetype, data)
{
	console.log('fetching image...');
	var suffix = mimetype.replace('image/', '');
	var fname = 'image_result.'+suffix;
	fs.writeFile(fname, data, 'binary', function(err)
	{
		if (err)
			console.log(err);
		else
			console.log('wrote image file to '+fname);
	});
});

new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'chainable-request 0.0.1' }).
	get('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
})
   .on('error', function(err)
{
	console.log('error in the regular GET test');
	console.log(err);
});

new requester({host: 'www.google.com' }).
	headers({ 'user-agent': 'node.js client 0.1' }).
	get('/').
	on('reply', function(response, body)
{
	console.log(response.headers['transfer-encoding']);
	console.log(body.toString().slice(0, 100));
}).on('error', function(err)
{
	console.log('error in the chunked GET test');
	console.log(err);
});


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'chainable-request 0.0.1' }).
	query({'why':'because I said so', 'okay':true}).
	get('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
}).on('error', function(err)
{
	console.log('error in the GET with querystring test');
	console.log(err);
});


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'chainable-request 0.0.1' }).
	body("BODY=BODY").
	post('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
})
	.on('error', function(err)
{
	console.log('error in the POST test');
	console.log(err);
});


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'chainable-request 0.0.1' }).
	body("SHOTPUT").
	put('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
})
	.on('error', function(err)
{
	console.log('error in the PUT test');
	console.log(err);
});


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'chainable-request 0.0.1' }).
	body("SHOTPUT").
	delete('/chainabletest').
	on('reply', function(response, body)
{
	console.log(body.toString());
})
	.on('error', function(err)
{
	console.log('error in the DELETE test');
	console.log(err);
});


new requester({host: 'localhost', port: 3009 })
	.headers({ 'user-agent': 'chainable-request 0.0.1' })
	.get('/authenticate-me')
	.on('reply', function(response, body)
{
	console.log(body.toString());
})
	.on('error', function(err)
{
	console.log('error in the basic auth test');
	console.log(err);
});
