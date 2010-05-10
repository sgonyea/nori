var util = require('./util')
  ,  sys = require('sys')

var MapReduce = function(client, options) {
  if(!options) options = {}
  this.client  = client
  this.timeout = (options.timeout || 60) * 1000
  this.inputs  = []
  this.phases  = []
}

// Public: Adds an input to the current MapReduce instance.  See Riak MapReduce
// docs for detailed info: https://wiki.basho.com/display/RIAK/MapReduce
//
// Examples:
//   var mapred = client.mapReduce()
//   // add a whole bucket
//   mapred.add('iron_mans')
//   // add a single resource by key
//   mapred.add('iron_mans', 'mark_1')
//   // add multiple resources by key from the given resources
//   bucket = client.bucket('iron_mans')
//   armor1 = bucket.build('mark_1')   // build or fetch them,
//   armor2 = bucket.build('extremis') // your choice
//   mapred.add([armor1, armor2])
//
// bucket - Either the String bucket name, or an array of Resource instances.
// key    - Optional String key name.
// keyArg - Optional String input annotation.
//
// Returns current MapReduce instance for method chaining.
MapReduce.prototype.add = function(bucket, key, keyArg) {
  if(typeof(bucket) == 'object' && !bucket.name) {
    var mapred = this
    bucket.forEach(function(resource) {
      mapred.inputs.push(new Input(resource.bucket.name, resource.key))
    })
  } else
    this.inputs.push(new Input(bucket, key, keyArg))
  return this
}

// Public: Adds a single map phase to the current MapReduce query.
//
// Examples
//   // specify map function options
//   mapred.map({language: 'javascript', 'name': 'Riak.mapValuesJson', keep:true})
//   // specify map function by bucket/key
//   // Runs the function in the contents of the mymap resource in the myjs bucket.
//   mapred.map({bucket: 'myjs', key: 'mymap'})
//   // specify an erlang function by name
//   mapred.map({language: 'erlang', module: 'riak_mapreduce', function: 'map_object_value'})
//   // specify a javascript function, and extra options
//   mapred.map(function(data, keyData, arg) {
//     return [data.key]
//   }, {keep: true})
//
// If you are specifying the source to javascript functions, be sure to 
// inclue semicolons because Riak collapses whitespace before running them.
//
// options - Either a Hash of phase options or a javascript function.  If a
//           function is given, it is set to the 'source' key of the map 
//           options.  If no 'language' key is set, then 'javascript' is 
//           assumed.
// extra   - Optional Hash of phase options only used if a javascript function
//           is passed in as the options argument.
//
// Returns current MapReduce instance for method chaining.
MapReduce.prototype.map = function(options, extra) {
  this.phases.push(new FunctionPhase('map', options, extra))
  return this
}

// Public: Adds a single reduce phase to the current MapReduce query.  See
// MapReduce.prototype.map for usage.
//
// Example:
//   // specify a javascript function
//   mapred.reduce(function(values) {
//     return [values.pop()]
//   })
//
// Returns current MapReduce instance for method chaining.
MapReduce.prototype.reduce = function(options, extra) {
  this.phases.push(new FunctionPhase('reduce', options, extra))
  return this
}

// Public: Runs the current MapReduce query.
//
// Examples
//   client.mapReduce()
//     .add('bucket', 'my-key')
//     .map(...)
//     .reduce(...)
//     .run(function(results) {
//       sys.puts('my findings: ' + sys.inspect(results))
//     })
//
// callback - Anonymous Function that takes 1 argument: the result from the
//            Map Reduce query.
//
// Returns nothing.
MapReduce.prototype.run = function(callback) {
  var body = this.body()
  body.query.forEach(function(phase) {
    var obj = phase.map || phase.reduce
    if(obj && typeof(obj.source) == 'function')
      obj.source = obj.source.toString()
  })
  this.client.request("POST", this.client.mapred, {}, body,
    function(client, resp, body) {
      callback(body)
    })
}

MapReduce.prototype.body = function() {
  var body = {inputs: [], query: [], timeout: this.timeout}
  if(this.inputs.length == 1 && !this.inputs[0].key) 
    body.inputs = this.inputs[0].bucket
  else {
    this.inputs.forEach(function(input) {
      body.inputs.push(input.body())
    })
  }
  this.phases.forEach(function(phase) {
    body.query.push(phase.body())
  })
  return body
}

var Input = function(bucket, key, keyArg) {
  this.bucket = bucket
  this.key    = key
  this.keyArg = keyArg
}

Input.prototype.body = function() {
  body = [this.bucket]
  if(this.key) {
    body.push(this.key)
    if(this.keyArg) body.push(this.keyArg)
  }
  return body
}

// represents either a MapPhase or a ReducePhase
var FunctionPhase = function(name, options, extra) {
  if(typeof(options) == 'function') {
    src     = options
    options = extra || {}
    options.source = src
  }
  if(!options.language) options.language = 'javascript'
  this.name    = name
  this.options = options
}

FunctionPhase.prototype.body = function() {
  o = {}
  o[this.name] = this.options
  return o
}

exports.MapReduce = MapReduce