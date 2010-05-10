var assert = require('assert')
  ,   nori = require('../lib')

var cli = nori.client()
assert.equal('127.0.0.1', cli.host)
assert.equal(8098,        cli.port)
assert.equal('/riak/',    cli.prefix)
assert.equal('/mapred',   cli.mapred)
assert.ok(cli.clientID)

cli = nori.client('http://server.com:4567/boom')
assert.equal('server.com', cli.host)
assert.equal(4567,         cli.port)
assert.equal('/boom/',     cli.prefix)

cli = nori.client('http://server.com:4567/boom', {host: 'abc', mapred: 'map', clientID: 'def'})
assert.equal('server.com', cli.host)
assert.equal(4567,         cli.port)
assert.equal('/boom/',     cli.prefix)
assert.equal('/map',       cli.mapred)
assert.equal('def',        cli.clientID)

cli = nori.client({host: 'server.com', port: 4567, prefix: 'boom', mapred: 'map', clientID: 'def'})
assert.equal('server.com', cli.host)
assert.equal(4567,         cli.port)
assert.equal('/boom/',     cli.prefix)
assert.equal('/map',       cli.mapred)
assert.equal('def',        cli.clientID)

var headers = cli.headers()
assert.ok(headers['User-Agent'].match(/Rhodes/))
assert.equal('application/json', headers['content-type'])
assert.equal('def',              headers['X-Riak-ClientId'])

var headers = cli.headers({'content-type': 'text/plain'})
assert.ok(headers['User-Agent'].match(/Rhodes/))
assert.equal('text/plain', headers['content-type'])
assert.equal('def',        headers['X-Riak-ClientId'])