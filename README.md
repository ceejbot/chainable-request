Inspired by [api-request](https://github.com/adaburrows/api_request), but handles chunked tranfers and binary data. Notably, also takes the output of `url.parse()` as ideal input for its constructor.

I wrote this because I needed it but there's no guarantee it's suitable for general use yet. My test cases were sort of ad-hoc.

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

## Creating a new request.

`var requester = new chainableRequest(options);`

Creates a new requester object modified by the requested options. The default request is to http://localhost:80/ using method GET.

The output of `url.parse()` is perfect input for `options`. Options is a hash containing one or any of:

hostname
: String with hostname or dotted quad. `localhost` by default.

host
: Synonym for *host*.

port
: Integer port number. `80` by default.

path
: String with path to request. `/` by default.

protocol
: String with desired protocol; must be `http` or `https`. `http` by default.


## Setting up the request.

`requester.host(hostname)`

Sets the host to the passed-in string name or dotted quad. Returns the requester object.

`requester.port(portnum)`

Sets the port number to the passed-in integer. Returns the requester object.

`requester.protocol(proto)`

Sets the protocol to the passed-in string. Returns the requester object.

`requester.headers(params)`

A hash of header name/value pairs. Returns the requester object.

`requester.content_type(type)`

Special case handling for the popular __Content-Type__ header. *Type* is a string containing the content-type to advertise. Returns the requester object.

`requester.query(params)`

*Params* must be a hash, which is turned into a query string using querystring.stringify. Used only in GETs. Returns the requester object.

`requester.body(data)`

If *data* is a hash, stringifies it using querystring. Otherwise, sets the request payload without further processing. Returns the requester object.

## Executing the request

Execute a request by calling one of the gang of four methods:

```
requester.get(path);
requester.post(path);
requester.put(path);
requester.delete(path);
```

*path* can be omitted to use a previously-configured path.

## Receiving the response

Handle the 'reply' and 'error' events.

```javascript
requester
	.get()
	.on('reply', function(response, body)
{
	// process successful request
})
	.on('error', function(err)
{
	// process error
});
```