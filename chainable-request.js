(function() {
'use strict';

var events      = require('events'),
    querystring = require('querystring'),
    util        = require('util')
    ;

function ChainableRequest(options)
{
	events.EventEmitter.call(this);

	var host = 'localhost';
	if (options && options.hostname)
		host = options.hostname;
	else if (options && options.host)
		host = options.host;

	this.parameters = {
		'method': 'GET',
		'headers': { },
		'host': host,
		'port': (options && options.port) ? options.port : 80,
		'path': (options && options.path) ? options.path : '/'
	};

	var protocol = 'http';
	if (options && options.protocol)
		protocol = options.protocol;
	protocol = protocol.replace(/:$/, '');
	this.proto = require(protocol);

	this.querystring = false;
}
util.inherits(ChainableRequest, events.EventEmitter);

ChainableRequest.prototype.host = function(host)
{
	this.parameters.host = host;
	return this;
};

ChainableRequest.prototype.port = function(port)
{
	this.parameters.port = port;
	return this;
};

ChainableRequest.prototype.protocol = function(proto)
{
	// TODO restrict protocols to one of http, https
	if (proto[proto.length - 1] === ':')
		proto = proto.slice(0, -1);
	this.proto = require(proto);
	return this;
};

ChainableRequest.prototype.headers = function(headers)
{
	__extend(this.parameters.headers, headers);
	return this;
};

ChainableRequest.prototype.content_type = function(type)
{
	__extend(this.parameters.headers, {'Content-Type': type});
	return this;
};

ChainableRequest.prototype.query = function(params)
{
	this.querystring = querystring.stringify(params);
	return this;
};

ChainableRequest.prototype.body = function(body)
{
	if (typeof body === 'object')
	{
		this.payload = querystring.stringify(body);
		this.content_type('application/x-www-form-urlencoded');
	}
	else
		this.payload = body;
	return this;
};

ChainableRequest.prototype.basic_auth = function(user, password)
{
	// TODO test-- completely unexercised code.
	var enc = new Buffer(user+':'+password).toString('base64');
	__extend(this.parameters.headers, { 'Authorization': 'Basic '+enc });
	return this;
};

ChainableRequest.prototype.path = function(rpath)
{
	this.parameters.path = rpath;
	return this;
};

ChainableRequest.prototype.method = function(method)
{
	this.parameters.method = method;
	return this;
};

ChainableRequest.prototype.get = function(path)
{
	if (path)
		this.parameters.path = path;
	if (this.querystring)
		this.parameters.path = this.parameters.path + '?' + this.querystring;

	this.execute();
	return this;
};

ChainableRequest.prototype.post = function(path)
{
	this.parameters.method = 'POST';
	if (path)
		this.parameters.path = path;

	this.execute();
	return this;
};

ChainableRequest.prototype.put = function(path)
{
	this.parameters.method = 'PUT';
	if (path)
		this.parameters.path = path;

	this.execute();
	return this;
};

ChainableRequest.prototype.delete = function(path)
{
	this.parameters.method = 'DELETE';
	if (path)
		this.parameters.path = path;

	this.execute();
	return this;
};

ChainableRequest.prototype.execute = function(callback)
{
	var self = this;

	if (self.payload === undefined)
		__extend(this.parameters.headers, {'Content-Length': 0});
	else
		__extend(this.parameters.headers, {'Content-Length': Buffer.byteLength(self.payload)});

	var request = self.proto.request(self.parameters, function(response)
	{
		self.handleResponse(response, callback);
	});

	request.on('error', function(err)
	{
		if (callback && (typeof callback === 'function'))
			callback(err);
		else
			self.emit('error', err);
	});

	if (this.payload !== undefined)
		request.write(this.payload);

	request.end();
};

function parseMimeType(header)
{
	var result = {};
	var pieces = header.split(';');
	result.mimetype = pieces[0].trim();
	if (pieces.length > 1)
		result.charset = pieces[1].replace('charset=', '').trim();
	else
		result.charset = 'utf8';

	return result;
}

function processResponse(mimetype, data)
{
	var result = data;
	var type = parseMimeType(mimetype);

	switch(type.mimetype)
	{
		case 'text/plain':
		case 'text/html':
			result = data.toString('utf8');
			break;

		case 'application/x-www-form-urlencoded':
			result = querystring.parse(data.toString('utf8'));
			break;

		case 'application/json':
			result = JSON.parse(data.toString('utf8'));
			break;

		case 'image/png':
		case 'image/jpg':
		case 'image/jpeg':
		case 'image/gif':
			// no-op
			break;

		default:
			console.log(type);
			break;
	}

	return result;
}

ChainableRequest.prototype.handleResponse = function(response, callback)
{
	var self = this;
	var data = null;

	var complete = function()
	{
		var processed = processResponse(response.headers['content-type'], data);
		if (callback && (typeof callback === 'function'))
			callback(null, response, processed);
		self.emit('reply', response, processed);
	};

	response.on('data', function(chunk)
	{
		if (!data)
			data = chunk;
		else
		{
			var tmp = new Buffer(data.length + chunk.length);
			data.copy(tmp, 0);
			chunk.copy(tmp, data.length);
			data = tmp;
		}
	});

	response.on('end', complete);
	response.on('close', complete);
};

function __extend(destination, source)
{
	var keys = Object.keys(source);
	for (var i = 0; i < keys.length; i++)
		destination[keys[i]] = source[keys[i]];
	return destination;
}

exports.ChainableRequest = ChainableRequest;

}.call(this));
