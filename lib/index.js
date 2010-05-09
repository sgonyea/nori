var Client = require('./client').Client

// Initializes a new Rhodes Client instance.
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
exports.client = function(uri, options) { 
  return new Client(uri, options)
}