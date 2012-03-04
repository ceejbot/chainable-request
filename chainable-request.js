var chainableRequest = ((typeof module !== 'undefined') && module.exports) || {};

(function(exports)
{

var events      = require('events');
    querystring = require('querystring');

function chainableRequest(options)
{
	events.EventEmitter.call(this);
	
	var host = 'localhost';
	if (options.hostname !== undefined)
		host = options.hostname;
	else if (options.host !== undefined)
		host = options.host;
	
	this.parameters = {
		'method': 'GET',
		'headers': { },
		'host': host,
		'port': (options.port === undefined) ? 80 : options.port,
		'path': (options.path === undefined) ? '/' : options.path
	};
	var protocol = 'http';
	// TODO enforce protocol as http or https
	if (options.protocol && (options.protocol[options.protocol.length - 1] == ':'))
		protocol = options.protocol.slice(0, -1);
	this.protocol = require(protocol);

	this.querystring = false;
}
chainableRequest.super_ = events.EventEmitter;
chainableRequest.prototype = Object.create(
	events.EventEmitter.prototype,
	{
		constructor:
		{
			value: chainableRequest,
			enumerable: false
		}
	}
);
exports.chainableRequest = chainableRequest;

chainableRequest.prototype.host = function(host)
{
	this.parameters.host = host;
	return this;
};

chainableRequest.prototype.port = function(port)
{
	this.parameters.port = port;
	return this;
};

chainableRequest.prototype.protocol = function(proto)
{
	// TODO restrict protocols to one of http, https
	if (proto[proto.length - 1] == ':')
		proto = proto.slice(0, -1);
	this.protocol = require(proto);
	return this;
};

chainableRequest.prototype.headers = function(headers)
{
	__extend(this.parameters.headers, headers);
	return this;
};

chainableRequest.prototype.content_type = function(type)
{
	__extend(this.parameters.headers, {'Content-Type': type});
	return this;
};

chainableRequest.prototype.query = function(params)
{
	this.querystring = querystring.stringify(params);
	return this;
};

chainableRequest.prototype.body = function(body)
{
	if (typeof body == 'object')
	{
		this.payload = querystring.stringify(body);
		this.content_type('application/x-www-form-urlencoded');
	}
	else
		this.payload = body;
	return this;
};

chainableRequest.prototype.basic_auth = function(user, password)
{
	// TODO test-- completely unexercised code.
	var enc = new Buffer(user+':'+password).toString('base64');
	__extend(this.parameters.headers, { 'Authorization': 'Basic '+enc });
	return this;
};

chainableRequest.prototype.get = function(path)
{
	if (path !== undefined)
		this.parameters.path = path;
	if (this.querystring)
		this.parameters.path = this.parameters.path + '?' + this.querystring;		

	this.execute();
	return this;
};

chainableRequest.prototype.post = function(path)
{
	this.parameters.method = 'POST';
	if (path !== undefined)
		this.parameters.path = path;

	this.execute();
	return this;
};

chainableRequest.prototype.put = function(path)
{
	this.parameters.method = 'PUT';
	if (path !== undefined)
		this.parameters.path = path;

	this.execute();
	return this;
};

chainableRequest.prototype.delete = function(path)
{
	this.parameters.method = 'DELETE';
	if (path !== undefined)
		this.parameters.path = path;

	this.execute();
	return this;
};

chainableRequest.prototype.execute = function()
{
	var self = this;
	
	if (self.payload === undefined)
		__extend(this.parameters.headers, {'Content-Length': 0});
	else
		__extend(this.parameters.headers, {'Content-Length': Buffer.byteLength(self.payload)});
	
	var request = self.protocol.request(self.parameters, function(response)
	{
		if ((response.headers['transfer-encoding'] == 'chunked'))
			self.handleChunkedResponse(response);
		else
			self.handleResponse(response);	
	});
	
	request.on('error', function(err)
	{
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
		result.charset = 'ascii';
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
			result = data.toString(type.charset);
			break;

		case 'application/x-www-form-urlencoded':
			result = querystring.parse(data.toString(type.charset))
			break;

		case 'application/json':
			result = JSON.parse(data.toString(type.charset))
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

chainableRequest.prototype.handleResponse = function(response)
{
	var self = this;

	var size = parseInt(response.headers['content-length']);
	var buffptr = 0;
	var data = new Buffer(size);

	response.on('data', function(chunk)
	{
		chunk.copy(data, buffptr);
		buffptr += chunk.length;
	});

	var complete = function()
	{
		self.emit('reply', response, processResponse(response.headers['content-type'], data));
	};

	response.on('end', function()
	{
		complete();
	});

	response.on('close', function()
	{
		complete();
	});
}

chainableRequest.prototype.handleChunkedResponse = function(response)
{
	var self = this;
	var data = null;
	
	var complete = function()
	{		
		self.emit('reply', response, processResponse(response.headers['content-type'], data));
	};

	response.on('data', function(chunk)
	{
		if (data == null)
			data = chunk;
		else
		{
			var tmp = new Buffer(data.length + chunk.length);
			data.copy(tmp, 0);
			chunk.copy(tmp, data.length);
			data = tmp;
		}
	});

	response.on('end', function()
	{
		complete();
	});

	response.on('close', function()
	{
		complete();
	});
}

function __extend(destination, source)
{
	for (var property in source)
	{
		if (source.hasOwnProperty(property))
			destination[property] = source[property];
	}
	return destination;
}

exports.chainableRequest = chainableRequest;

})(chainableRequest);
