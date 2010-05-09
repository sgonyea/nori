var assert = require('assert')
  , Client = require('../lib/client').Client

var cli = new Client()

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

bucket.prop('n_val', 2)(function(b) {
  assert.equal(2, b.props.n_val)
})

bucket.prop({'n_val': 3})(function(b) {
  assert.equal(3, b.props.n_val)
})