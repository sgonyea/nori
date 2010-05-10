var Bucket = require('./bucket').Bucket
  ,    url = require('url')
  ,    sys = require('sys')
  ,    b64 = require('./base64')
  ,   http = require('http')
  ,   util = require('./util')

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

  this.host     = options.host     || '127.0.0.1'
  this.port     = options.port     || 8098
  this.prefix   = options.prefix   || '/riak/'
  this.mapred   = options.mapred   || '/mapred'
  this.clientID = options.clientID || this.makeClientID()
  this.http     = http.createClient(this.port, this.host)
  if(!this.prefix.match(/\/$/)) this.prefix = this.prefix + '/'
  if(!this.prefix.match(/^\//)) this.prefix = '/' + this.prefix
  if(!this.mapred.match(/^\//)) this.mapred = '/' + this.mapred
}

Client.version = '0.1.0'

// Public: Initializes a new Bucket instance without fetching its properties.
//
// name - String name of the bucket.  This will be used in the resource URL.
//
// Returns new Bucket instance.
Client.prototype.bucket = function(name) {
  return new Bucket(this, name)
}

Client.prototype.getRequest = function(path, customHeaders, callback) {
  this.request('GET', path, customHeaders, null, callback)
}

Client.prototype.request = function(method, path, customHeaders, body, callback) {
  var headers = this.headers(customHeaders)
    ,  rhodes = this
    ,     req = this.http.request(method, this.prefix+path, headers)

  req.addListener('response', function(resp) {
    var body = ''
    resp.setEncoding('utf8')
    resp.addListener('data', function(chunk) {
      body += chunk
    })
    resp.addListener('end', function() {
      if((resp.headers['content-type'] == 'application/json') && 
          body.length > 0)
        body = JSON.parse(body)
      callback(rhodes, resp, body)
    })
  })
  if(body) {
    if(typeof(body) != 'string' && headers['content-type'] == 'application/json')
      body = JSON.stringify(body)
    req.write(body)
  }
    
  req.end()
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