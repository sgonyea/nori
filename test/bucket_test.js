var assert = require('assert')
  , Client = require('../lib/client').Client

var cli = new Client()

var bucket = cli.bucket('iron_mans')
assert.equal('iron_mans', bucket.name)
assert.equal(cli,         bucket.client)
assert.equal(null,        bucket.props)