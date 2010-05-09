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
  return function(callback) {
    callback(bucket.props[n], bucket)
  }
}

Bucket.prototype.getProps = function() {
  var bucket = this
  return function(callback) {
    callback(bucket.props, bucket)
  }
}

Bucket.prototype.setProp = function(name, value) {
  if(!this.props) this.props = {}
  var bucket = this
  return function(callback) {
    bucket.props[name] = value
    callback(bucket)
  }
}

Bucket.prototype.setProps = function(options) {
  if(!this.props) this.props = {}
  var bucket = this
  return function(callback) {
    util.extend(bucket.props, options)
    callback(bucket)
  }
}

exports.Bucket = Bucket