var 
	requester = require('../chainable-request.js').chainableRequest,
	url       = require('url');

imgurl = 'http://l-userpic.livejournal.com/77595913/9711196';

function fetchImage(imgurl, callback)
{
	var uri = url.parse(imgurl);
	
	new requester(uri).
		headers({ 'user-agent': 'ljmigrate.js 0.1' }).
		get().
		on('reply', function(response, body)
	{
		var mimetype = response.headers['content-type'];		
		callback(mimetype, body);
	});	
}


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'ljmigrate.js 0.1' }).
	get('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
});	

new requester({host: 'www.google.com' }).
	headers({ 'user-agent': 'node.js client 0.1' }).
	get('/').
	on('reply', function(response, body)
{
	console.log(response.headers['transfer-encoding']);
	console.log(body.toString());
});	

new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'ljmigrate.js 0.1' }).
	query({'why':'because I said so', 'okay':true}).
	get('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
});	


new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'ljmigrate.js 0.1' }).
	body("BODY=BODY").
	post('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
});	

new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'ljmigrate.js 0.1' }).
	body("SHOTPUT").
	put('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
});	

new requester({host: 'localhost', port: 3009 }).
	headers({ 'user-agent': 'ljmigrate.js 0.1' }).
	body("SHOTPUT").
	delete('/chainabletest').
	on('reply', function(response, body)
{
	var mimetype = response.headers['content-type'];
	console.log(body.toString());
});	
