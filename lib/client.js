var url = require('url')
  , sys = require('sys')
  , b64 = require('./base64')

// Initializes a new Rhodes client instance.
//
// uri     - String uri for the Riak server.  Use it to set the default 
//           host/port/prefix values: "http://my-riak-server.com:4567/boom"
// options - Hash options to change default Client options:
//           host     - String host name for the Riak server.
//           port     - Port Number of the Riak server.
//           prefix   - String prefix path for the Riak server (default: /riak/).
//           mapred   - String prefix path for the map reduce resource.
//           clientID - String header value for the X-Riak-Client header.
//
// Returns Client instance.
var Client = function(uri, options) {
  if(typeof(uri) == 'object') {
    options = uri
    uri     = null
  }
  if(!options) options = {}
  if(uri) {
    var parsed = url.parse(uri)
    options.host   = parsed.hostname
    options.port   = parsed.port
    options.prefix = parsed.pathname
  }

  this.host     = options.host     || '127.0.0.1'
  this.port     = options.port     || 8098
  this.prefix   = options.prefix   || '/riak/'
  this.mapred   = options.mapred   || '/mapred'
  this.clientID = options.clientID || this.makeClientID()

  if(!this.prefix.match(/\/$/)) this.prefix = this.prefix + '/'
  if(!this.prefix.match(/^\//)) this.prefix = '/' + this.prefix
  if(!this.mapred.match(/^\//)) this.mapred = '/' + this.mapred
}

Client.maxClientID = 4294967296;
Client.prototype.makeClientID = function() {
  return b64.encode(Math.floor(Math.random()*Client.maxClientID).toString())
}

exports.Client = Client