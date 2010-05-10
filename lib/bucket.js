var Resource = require('./resource').Resource
  ,     util = require('./util')
  ,      sys = require('sys')

var Bucket = function(client, name) {
  this.client = client
  this.name   = name
}

// Public: Initializes a new Resource without saving it into Riak.
//
// Example:
//   bucket.build('mark_1', {data:{pilot: 'stark'}})
//
// key     - Optional String key for the resource.  If not given, Riak will
//           generate a random one for you.
// options - Optional Hash of options for the Resource.
//           data: The Resource data.  This will be sent to Riak directly.  If
//                 The content-type is application/json, JSON.stringify will be 
//                 used before sending to Riak.
//
// Returns unsaved Resource instance.
Bucket.prototype.build = function(key, options) {
  return new Resource(this, key, options)
}

// Public: Fetches a resource from the Riak server.
//
// Example:
//   bucket.fetch('mark_1')(function(armor) {
//     sys.puts(armor.data.pilot)
//   })
// key - String key for the resource.
//
// Returns anonymous function expecting a callback.
Bucket.prototype.fetch = function(key) {
  var bucket = this
  return function(callback) {
    bucket.build(key).get(callback)
  }
}

// Public: Gets or sets property values for a bucket.  The properties are
// loaded lazily so that an HTTP request is not sent every time a new instance
// is created.
//
// Examples:
//
//   // get all properties
//   bucket.prop()(function(props, bucket) {
//     sys.puts(sys.inspect(props))
//   })
//
//   // get single property
//   bucket.prop('n_val')(function(n_val, bucket) {
//     sys.puts(sys.inspect(n_val))
//   })
//
//   // set single property
//   bucket.prop('n_val', 2)(function(bucket) {
//     sys.puts(bucket.name + ' value saved.')
//   })
//
//   // sets all properties
//   bucket.prop({n_val: 2})(function(bucket) {
//     sys.puts(bucket.name + ' values saved.')
//   })
//
// Returns anonymous function expecting a callback.
Bucket.prototype.prop = function(name) {
  var bucket = this
  if(arguments.length == 2) {
    return this.setProp(name, arguments[1])
  } else if(arguments.length == 0) {
    return this.getProps()
  } else {
    if(typeof(name) == 'string') {
      return this.getProp(name)
    } else {
      return this.setProps(name)
    }
  }
}

// Public: Reloads all properties for the Bucket from the Riak server.
//
// Example:
//   bucket.reload()(function(b) {
//     sys.puts(b.props.n_val)
//   })
//
// Returns anonymous function expecting a callback.
Bucket.prototype.reload = function() {
  var bucket = this
  return function(callback) {
    bucket.get(callback)
  }
}

// Public: Deletes a Resource with the given key without loading it from the
// Riak server first.
//
// Example:
//   bucket.del('my-key')(function(res) {
//     sys.puts(res.key + ' is gone')
//   })
//
// Returns anonymous function expecting a callback.
Bucket.prototype.del = function(key) {
  var bucket = this
  return function(callback) {
    bucket.build(key).del()(callback)
  }
}

// Public: Clears all keys for the given bucket by making an HTTP request
// for each resource.
//
// Example:
//   bucket.clear()(function(resource) {
//     sys.puts(resource.key + ' is gone')
//   })
//
// Returns anonymous function expecting a callback.
Bucket.prototype.clear = function() {
  var bucket = this
  return function(callback) {
    bucket.prop()(function(p, b) {
      if(b.keys.length == 0)
        callback(null)
      else {
        b.keys.forEach(function(key) {
          b.del(key)(callback)
        })
      }
    })
  }
}

Bucket.prototype.getProp = function(n) {
  var bucket = this
  if(this.props) {
    return function(callback) {
      if(callback) callback(bucket.props[n], bucket)
    }
  } else {
    return function(callback) {
      bucket.get(function(b) {
        if(callback) callback(b.props[n], b)
      })
    }
  }
}

Bucket.prototype.getProps = function() {
  var bucket = this
  if(this.props) {
    return function(callback) {
      if(callback) callback(bucket.props, bucket)
    }
  } else {
    return function(callback) {
      bucket.get(function(b) {
        if(callback) callback(b.props, b)
      })
    }
  }
}

Bucket.prototype.setProp = function(name, value) {
  var opt   = {}
  opt[name] = value
  return this.setProps(opt)
}

Bucket.prototype.setProps = function(options) {
  var bucket = this
  return function(callback) {
    bucket.put(options, callback)
  }
}

Bucket.prototype.load = function(body) {
  this.props = body.props
  this.keys  = body.keys
}

Bucket.prototype.get = function(callback) {
  var bucket = this
  this.client.getRequest(this.name, {},
    function(client, resp, body) {
      bucket.load(body)
      if(callback) callback(bucket)
    })
}

Bucket.prototype.put = function(data, callback) {
  var bucket = this
  this.client.request("PUT", this.name, {}, {props:data},
    function(client, resp, body) {
      bucket.props = null
      if(callback) callback(bucket)
    })
}

exports.Bucket = Bucket