var util = require('./util')
  ,  sys = require('sys')
  ,  url = require('url')

var Resource = function(bucket, key, options) {
  if(!options) options = {}
  this.bucket       = bucket
  this.client       = bucket.client
  this.key          = key
  this.data         = options.data
  this.contentType  = options.contentType || 'application/json'
  this.links        = []
  this.links.encode = function() {
    var encoded = []
    this.forEach(function(link) {
      encoded.push(link.encode())
    })
    return encoded.join(", ")
  }
}

// Public: Adds a link to the resource.  This is used whenever the Resource
// is being fetched from Riak, or when adding a link to be stored with
// the Resource contents.
//
// options - Object with these properties:
//           bucket - String name of the bucket that the link points to.
//           key    - Optional String name of the resource that the link 
//                    points to.
//           rel    - Optional String value of the rel attribute.
//           tag    - Optional String value of the riaktag attribute.
Resource.prototype.link = function(options) {
  this.links.push(new Link(this, options))
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
      {'Link':resource.links.encode()},
      function(client, resp, body) {
        if(!resource.id && resp.headers.location) {
          var id = resp.headers.location.split('/').pop()
          resource.key = id
        }
        if(callback) callback(resource)
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
    resource.request('DELETE', {}, function(client, resp, body) {
      if(callback) callback(resource)
    })
  }
}

Resource.prototype.processLinks = function(raw_links) {
  var res = this
  Link.parse(raw_links).forEach(function(link) {
    res.link(link)
  })
}

Resource.prototype.get = function(callback) {
  var resource = this
  this.client.getRequest(this.bucket.name + '/' + this.key, {}, 
    function(client, resp, body) {
      resource.data        = body
      resource.contentType = resp.headers['content-type']
      resource.etag        = resp.headers.etag
      if(resp.headers.link) {
        resource.processLinks(resp.headers.link)
      }
      if(callback) callback(resource)
    })
}

Resource.prototype.request = function(method, headers, callback) {
  path = this.bucket.name
  if(this.key) path += ('/' + this.key)

  var body = method == 'DELETE' ? null : this.data
  if(!headers) headers = {}
  headers['content-type'] = this.contentType
  this.client.request(method, path, headers, body, callback)
}

var Link = function(resource, link) {
  this.source = resource
  if(link) {
    this.bucket = resource.client.bucket(link.bucket)
    this.rel    = link.rel
    this.tag    = link.tag || link.riaktag
    if(link.key)
      this.resource = new Resource(this.bucket, link.key)
  }
}

Link.prototype.encode = function() {
  var path = [this.bucket.name]
  if(this.resource) path.push(this.resource.key)
  path = this.source.client.prefix + path.join("/")
  path = '<' + path + '>;'
  if(this.tag) {
    path += ' riaktag="' + this.tag + '"'
  } else if(this.rel) {
    path += ' rel="' + this.rel + '"'
  }
  return path
}

// Parses a given link header.
//
// raw_links - String link header (example: 
//             '</riak/armor>; rel="up", </riak/armor/foo>; riaktag="foo"')
//
// Returns an Array of Objects with these properties: bucket, key, rel, tag.
//   bucket  - String name of the bucket that the link points to.
//   key     - Optional String name of the resource that the link points to.
//   rel     - Optional String value of the rel attribute.
//   riaktag - Optional String value of the riaktag attribute.
Link.parse = function(raw_links) {
  var links = []
  raw_links.split(",").forEach(function(raw_link) {
    var link  = {}
    link = util.extend(link, Link.parsePath(raw_link))
    link = util.extend(link, Link.parseAttributes(raw_link))
    links.push(link)
  })
  return links
}

Link.parsePath = function(raw_link) {
  var m = raw_link.match(/\<([^\>]+)>/)
  var pieces = m[1].split("/")
  pieces.shift() // empty
  pieces.shift() // riak prefix
  return {bucket: pieces.shift(), key: pieces.shift()}
}

Link.parseAttributes = function(raw_link) {
  var attr   = {}
  var params = raw_link.split(";")[1].split(',')
  params.forEach(function(param) {
    var pair  = param.split('=')
    var key   = pair[0].trim()
    var value = pair[1].replace(/^"|"$/g, "")

    attr[key] = value
  })
  return attr
}

exports.Resource = Resource
exports.Link     = Link