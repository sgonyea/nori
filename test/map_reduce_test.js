var assert   = require('assert')
  , Client   = require('../lib/client').Client
  ,    sys   = require('sys')
  , riakUtil = require('../lib/riak')
  ,     Riak = riakUtil.Riak

var client = new Client()
var bucket = client.bucket('goog')

function getHighs(value, keyData, arg) {
  var data = Riak.mapValuesJson(value)[0];
  if(data.High > 501)
    return [data.High];
  else
    return [];
}

function sumHighs(values, arg) {
  return [values.reduce(function(acc, high) {
    return acc + high
  }, 0)]
}

// taken from the Riak Fast Track
// https://wiki.basho.com/display/RIAK/Loading+Data+and+Running+MapReduce+Queries
var data = [{Date: '2010-05-05', High: 500.98, Low:515.72}
  ,         {Date: '2010-05-04', High: 526.52, Low:526.74}
  ,         {Date: '2010-05-03', High: 526.50, Low:532.92}]

var items = []

// insert data into the goog bucket
data.forEach(function(data) {
  var res = bucket.build()
  res.data = data
  res.store()(function(r) { items.push(r) })
})

bucket.prop()(function(p, b) {
  // ensure all 3 keys are loaded
  assert.ok(b.keys.length >= 3)

  var mapred = client.mapReduce()
  assert.equal(60000, mapred.timeout)
  assert.equal(0,     mapred.inputs.length)
  assert.equal(0,     mapred.phases.length)

  mapred.add(items)
  assert.equal(3,            mapred.inputs.length)
  assert.equal('goog',       mapred.inputs[0].bucket)
  assert.equal('goog',       mapred.inputs[1].bucket)
  assert.equal('goog',       mapred.inputs[2].bucket)
  assert.equal(items[0].key, mapred.inputs[0].key)
  assert.equal(items[1].key, mapred.inputs[1].key)
  assert.equal(items[2].key, mapred.inputs[2].key)

  mapred.map(getHighs, {keep: true})
    .map(getHighs)

  assert.equal(2, mapred.phases.length)
  assert.equal('javascript', mapred.phases[0].options.language)
  assert.equal('javascript', mapred.phases[1].options.language)
  assert.ok( mapred.phases[0].options.keep)
  assert.ok(!mapred.phases[1].options.keep)
  mapred.phases.pop()

  // check the full body of the map/reduce request
  var body = mapred.body()
  assert.equal(60000, body.timeout)
  assert.equal(1, body.query.length)
  assert.deepEqual(['goog', items[0].key], body.inputs[0])
  assert.deepEqual(['goog', items[1].key], body.inputs[1])
  assert.deepEqual(['goog', items[2].key], body.inputs[2])
  assert.deepEqual({source: getHighs, language: 'javascript', keep: true}, 
    body.query[0].map)

  // run the map/reduce function
  mapred.run(function(results) {
    assert.equal(2, results.length)
    assert.ok(results.indexOf(526.52) > -1)
    assert.ok(results.indexOf(526.50) > -1)

    // now, let's run a map + reduce function
    mapred.reduce(sumHighs, {keep: true})
    mapred.reduce(sumHighs)
    assert.equal(3, mapred.phases.length)
    assert.equal('javascript', mapred.phases[1].options.language)
    assert.equal('javascript', mapred.phases[2].options.language)
    assert.ok( mapred.phases[1].options.keep)
    assert.ok(!mapred.phases[2].options.keep)
    mapred.phases.pop()
    mapred.phases[0].options.keep = false // don't keep initial map phase

    // check body with map + reduce
    var body = mapred.body()
    assert.equal(2, body.query.length)
    assert.deepEqual({source: sumHighs, language: 'javascript', keep: true}, 
      body.query[1].reduce)

    // run the map/reduce function
    mapred.run(function(results) {
      assert.equal(526.52+526.50, results[0])

      bucket.clear()()
    })
  })
})