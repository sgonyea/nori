var sys = require('sys')
  , url = require('url')

var Resource = function(bucket, key, options) {
  if(!options) options = {}
  this.bucket      = bucket
  this.client      = bucket.client
  this.key         = key
  this.data        = options.data
  this.contentType = options.contentType || 'application/json'
}

// Public: Stores the current Resource in the Riak server.  If a key is 
// present, an HTTP PUT request is sent to create/update the resource.
// Otherwise, an HTTP POST request is sent, and a random key is returned by
// the server.
//
// Example:
//   var resource  = bucket.build()
//   resource.data = {a: 'b'}
//   resource.store()(function(res) {
//     sys.puts('new resource: ' + res.key)
//   })
//
// Returns anonymous function expecting a callback.
Resource.prototype.store = function() {
  var resource = this
  return function(callback) {
    resource.request(resource.key ? 'PUT' : 'POST', 
      function(client, resp, body) {
        if(!resource.id && resp.headers.location) {
          var id = resp.headers.location.split('/').pop()
          resource.key = id
        }
        callback(resource)
      })
  }
}

// Public: Deletes the current resource from the server.
//
// Example:
//   resource = bucket.fetch('my-key')
//   resource.del()(function(res) {
//     sys.puts(res.key + ' is gone')
//   })
//
// Returns anonymous function expecting a callback.
Resource.prototype.del = function() {
  var resource = this
  return function(callback) {
    resource.request('DELETE', function(client, resp, body) {
      callback(resource)
    })
  }
}

Resource.prototype.get = function(callback) {
  var resource = this
  this.client.getRequest(this.bucket.name + '/' + this.key, {}, 
    function(client, resp, body) {
      resource.data        = body
      resource.contentType = resp.headers['content-type']
      resource.etag        = resp.headers.etag
      callback(resource)
    })
}

Resource.prototype.request = function(method, callback) {
  path = this.bucket.name
  if(this.key) path += ('/' + this.key)

  var body = method == 'DELETE' ? null : this.data
  this.client.request(method, path, {'content-type':this.contentType}, 
    body, callback)
}

exports.Resource = Resource