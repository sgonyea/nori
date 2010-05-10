var util = require('./util')
  ,  sys = require('sys')

var MapReduce = function(client, options) {
  if(!options) options = {}
  this.client  = client
  this.timeout = (options.timeout || 60) * 1000
  this.inputs  = []
  this.phases  = []
}

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

MapReduce.prototype.map = function(options, extra) {
  this.phases.push(new MapPhase(options, extra))
  return this
}

MapReduce.prototype.run = function(callback) {
  var body = this.body()
  body.query.forEach(function(phase) {
    var obj = phase.map
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
  this.inputs.forEach(function(input) {
    body.inputs.push(input.body())
  })
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

// {"map":{"language":"javascript","source":"function(v) { return [v]; }","keep":true}}
// {"map":{"language":"javascript","bucket":"myjs","key":"mymap","keep":false}}
// {"map":{"language":"erlang","module":"riak_mapreduce","function":"map_object_value"}}
var MapPhase = function(options, extra) {
  if(typeof(options) == 'function') {
    src     = options
    options = extra || {}
    options.source = src
  }
  if(!options.language) options.language = 'javascript'
  this.options = options
}

MapPhase.prototype.body = function() {
  return {map: this.options}
}

exports.MapReduce = MapReduce