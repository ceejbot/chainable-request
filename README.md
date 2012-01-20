Documentation etc later, probably about the time I write serious test cases. I wrote this because I needed it but there's no guarantee it's suitable for general use yet.

Inspired by [api-request](https://github.com/adaburrows/api_request), but handles chunked tranfers and binary data. Notably, also takes the output of `url.parse()` as ideal input for its constructor.

Brief example:

```javascript
var requester = require('chainable-request').chainableRequest;

new requester({ hostname: 'localhost', port: 3000 }).
	content_type('application/x-www-form-urlencoded').
	body({'why': 'because I said so'}).
	post('/reasons').
	on('reply', function(response, body)
{
	console.log(body);
};
```

Or a chunked get:

```javascript
new requester({host: 'www.google.com' }).
	headers({ 'user-agent': 'Pretend To Be Mozilla 4.0' }).
	get('/').
	on('reply', function(response, body)
{
	console.log(response.headers['transfer-encoding']);
	console.log(body.toString());
});
```
