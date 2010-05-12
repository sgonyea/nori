var assert = require('assert')
  ,   nori = require('../lib')
  ,    sys = require('sys')

var cli = nori.client()
var bucket = cli.bucket('armor')
var mark_1 = bucket.build('mark_1')
assert.equal('application/json', mark_1.contentType)

assert.equal('text/plain', bucket.build('mark_1', {contentType: 'text/plain'}).contentType)

var deleted = -1
  , keys    = -1

// store resource with key
mark_1.data = {pilot: 'stark'}
mark_1.store()(function(res) {
  assert.equal('stark', res.data.pilot)

  // fetch resource
  bucket.fetch('mark_1')(function(res) {
    assert.equal(1, res.links.length)
    assert.equal(res,         res.links[0].source)
    assert.equal('up',        res.links[0].rel)
    assert.equal(bucket.name, res.links[0].bucket.name)
    assert.equal(null,        res.links[0].resource)

    assert.equal('stark', res.data.pilot)

    // store resource without key
    var warMachine = bucket.build()
    warMachine.data = {pilot: 'rhodes'}
    warMachine.store()(function(res) {
      assert.equal('rhodes', res.data.pilot)
      assert.equal('string', typeof(res.key))

      // check that both resources are in bucket.keys
      bucket.reload()(function(b) {
        keys = b.keys.length
        assert.ok(keys >= 2)
        assert.ok(b.keys.indexOf('mark_1')       > -1)
        assert.ok(b.keys.indexOf(warMachine.key) > -1)

        // delete resource by key
        mark_1.del()(function() {
          bucket.reload()(function(b) {
            assert.equal(keys-1, b.keys.length)
            assert.equal(-1, b.keys.indexOf('mark_1'))
            assert.ok(b.keys.indexOf(warMachine.key) > -1)

            deleted = 0

            // delete all resources
            bucket.clear()(function(res) {
              if(res)
                deleted += 1
            })
          })
        })
      })
    })
  })
})

process.addListener('exit', function() {
  assert.equal(keys-1, deleted)
})