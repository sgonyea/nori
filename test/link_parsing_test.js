var assert = require('assert')
  ,   Link = require('../lib/resource').Link

header = '</riak/armor>; rel="up", </riak/foo/bar>; riaktag="blah"'

links = Link.parse(header)

assert.equal(2, links.length)

assert.equal('armor', links[0].bucket)
assert.equal(null,    links[0].key)
assert.equal('up',    links[0].rel)
assert.equal(null,    links[0].riaktag)
assert.equal('foo',   links[1].bucket)
assert.equal('bar',   links[1].key)
assert.equal(null,    links[1].rel)
assert.equal('blah',  links[1].riaktag)