var MapReduce = require('./map_reduce').MapReduce
  , Bucket    = require('./bucket').Bucket
  ,    url    = require('url')
  ,    sys    = require('sys')
  ,    b64    = require('./base64')
  ,   http    = require('http')
  ,   util    = require('./util')

exports.version = '0.1.0'

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

var Client = function(uri, options) {
  if(typeof(uri) == 'object') {
    options = uri
    uri     = null
  }
  if(!options) options = {}
  if(uri) {
    var parsed     = url.parse(uri)
    options.host   = parsed.hostname
    options.port   = parsed.port
    options.prefix = parsed.pathname
  }

  this.host     = options.host     || Client.defaultHost
  this.port     = options.port     || Client.defaultPort
  this.prefix   = options.prefix   || Client.defaultPrefix
  this.mapred   = options.mapred   || Client.defaultMapRed
  this.clientID = options.clientID || this.makeClientID()
  this.http     = http.createClient(this.port, this.host)
  if(!this.prefix.match(/\/$/)) this.prefix = this.prefix + '/'
  if(!this.prefix.match(/^\//)) this.prefix = '/' + this.prefix
  if(!this.mapred.match(/^\//)) this.mapred = '/' + this.mapred
}

Client.defaultHost   = '127.0.0.1'
Client.defaultPort   = 8098
Client.defaultPrefix = '/riak/'
Client.defaultMapRed = '/mapred'

// Public: Initializes a new Bucket instance without fetching its properties.
//
// name - String name of the bucket.  This will be used in the resource URL.
//
// Returns new Bucket instance.
Client.prototype.bucket = function(name) {
  return new Bucket(this, name)
}

// Public: Initializes a blank MapReduce request.
//
// Returns a new MapReduce instance
Client.prototype.mapReduce = function(options) {
  return new MapReduce(this, options)
}

Client.prototype.getRequest = function(path, customHeaders, callback) {
  this.request('GET', path, customHeaders, null, callback)
}

Client.prototype.request = function(method, path, customHeaders, body, callback) {
  if(!path.match(/^\//))
    path = this.prefix + path

  var headers = this.headers(customHeaders)
    ,  rhodes = this
    ,     req = this.http.request(method, path, headers)

  req.addListener('response', function(resp) {
    var body = [] // an array in case of chunked encoding
    resp.setEncoding('utf8')
    resp.addListener('data', function(chunk) {
      body.push(chunk)
    })
    resp.addListener('end', function() {
      if(resp.headers['transfer-encoding'] == 'chunked') {
        body = rhodes.assembleChunkedResponse(body)
      } else if((resp.headers['content-type'] == 'application/json') && 
          body.length > 0) {
        body = JSON.parse(body[0])
      } else {
        body = body.join("\n")
      }
      if(callback) callback(rhodes, resp, body)
    })
  })
  if(body) {
    if(typeof(body) != 'string' && headers['content-type'] == 'application/json')
      body = JSON.stringify(body)
    req.write(body)
  }

  req.end()
}

// Attempts to assemble a chunked response, which is an array of strings 
// built from the data event on the http response.  Assume chunks are
// JSON fragments that should be joined into one mega-JSON-object.  Hashes
// are extended, array values are pushed, scalars are replaced.  Probably
// doesn't handle smart merging of multiple nested hashes.
Client.prototype.assembleChunkedResponse = function(chunks) {
  var obj    = JSON.parse(chunks.shift())
  var buffer = ''
  var chunk
  while(chunks.length > 0) {
    chunk = chunks.shift()
    try {
      var json = JSON.parse(buffer + chunk)
      Object.keys(json).forEach(function(key) {
        var existing = obj[key]
        if(!existing) {
          obj[key] = json[key]
        } else if(existing instanceof Array) {
          json[key].forEach(function(v) {
            existing.push(v)
          })
        } else if(existing instanceof Object) {
          obj[key] = util.extend(existing, json[key])
        }
      })
      buffer = ''
    } catch(err) {
      buffer += chunk
      // sometimes what looks like valid json from the regexes isn't:
      //   {"a": {"b": 1}
      // starting and ending brackets, but still invalid.
      // hopefully the next chunk will finish the json.
      if(this.debug || err.name != 'SyntaxError') {
        sys.puts(sys.inspect(text))
        sys.puts(err.stack)
      }
    }
  }
  return obj
}

// Builds a default set of HTTP Headers for all requests.
//
// options - Hash of custom headers.
//
// Returns Hash of headers.
Client.prototype.headers = function(options) {
  if(!options) options = {}
  return util.extend({
    'User-Agent':      'Rhodes Riak node.js client v' + Client.version
  , 'content-type':    'application/json'
  , 'X-Riak-ClientId': this.clientID
  }, options)
}

Client.maxClientID = 4294967296;
Client.prototype.makeClientID = function() {
  return b64.encode(Math.floor(Math.random()*Client.maxClientID).toString())
}

exports.Client = Client