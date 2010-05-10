var assert = require('assert')
  , rhodes = require('../lib')

var cli = rhodes.client()

var bucket = cli.bucket('iron_mans')
assert.equal('iron_mans', bucket.name)
assert.equal(cli,         bucket.client)
assert.equal(null,        bucket.props)

bucket.props = {n_val: 3}
bucket.prop('n_val')(function(n_val, b) {
  assert.equal(3, n_val)
  assert.equal(3, b.props.n_val)
})

bucket.prop()(function(props, b) {
  assert.equal(3, props.n_val)
  assert.equal(3, b.props.n_val)
})

// ok, let's test it WITH http requests
bucket.props = null
bucket.prop('n_val')(function(n_val, b) {
  assert.equal(3, n_val)
  assert.equal(3, b.props.n_val)

  // get all values
  bucket.props = null
  bucket.prop()(function(props, b) {
    assert.equal(3, props.n_val)
    assert.equal(3, b.props.n_val)

    // set a single value
    bucket.prop('n_val', 2)(function(b) {
      assert.equal(null, b.props)
      b.prop()(function(props) {
        assert.equal(2, props.n_val)

        // set multiple values
        bucket.prop({'n_val': 3})(function(b) {
          assert.equal(null, b.props)
          b.prop()(function(props) {
            assert.equal(3, props.n_val)

            // check reload
            bucket.props.n_val = 1
            bucket.reload()(function(b) {
              assert.equal(3, b.props.n_val)
            })
          })
        })
      })
    })
  })
})