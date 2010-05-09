var util = require('./util')
  ,  sys = require('sys')

var Bucket = function(client, name) {
  this.client = client
  this.name   = name
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
// Returns anonymous function expecting a callback.  If no callback is given,
// fire off the request and forget about it.
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

Bucket.prototype.getProp = function(n) {
  var bucket = this
  if(this.props) {
    return function(callback) {
      callback(bucket.props[n], bucket)
    }
  } else {
    return function(callback) {
      bucket.get(function(b) {
        callback(b.props[n], b)
      })
    }
  }
}

Bucket.prototype.getProps = function() {
  var bucket = this
  if(this.props) {
    return function(callback) {
      callback(bucket.props, bucket)
    }
  } else {
    return function(callback) {
      bucket.get(function(b) {
        callback(b.props, b)
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
  this.client.getRequest("GET", this.name, {},
    function(client, resp, body) {
      bucket.load(body)
      callback(bucket)
    })
}

Bucket.prototype.put = function(data, callback) {
  var bucket = this
  this.client.request("PUT", this.name, {}, {props:data},
    function(client, resp, body) {
      bucket.props = null
      callback(bucket)
    })
}

exports.Bucket = Bucket