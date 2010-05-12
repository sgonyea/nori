var assert = require('assert')
  ,   nori = require('../lib')
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

var client = nori.client()
  ,    res = {"client":client}
  ,   link = (new Link(res, {bucket: 'foo', key: 'bar', tag: 'baz'}))

assert.equal('</riak/foo/bar>; riaktag="baz"', link.encode())

link = new Link(res, {bucket: 'foo', rel: 'baz'})
assert.equal('</riak/foo>; rel="baz"', link.encode())