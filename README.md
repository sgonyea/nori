# Nori

Riak HTTP Client for Node.js, inspired by Ripple.

Since most of the functions make HTTP client calls, they return anonymous
functions that take a single callback argument.

Implemented API:

    var   nori = require('nori')
      , client = new nori.client()
      , bucket = client.bucket('armor')

    // get a property
    bucket.prop('name')(function(name) {
      sys.puts(name)
    })

    // get all properties
    bucket.prop()(function(props) {
      sys.puts(props.name)
    })

    // set a property
    bucket.prop('n_val', '2')()

    // set multiple properties
    bucket.prop(n_val: 2, allow_mult: true)()

    // GET /armor/mark_1
    bucket.fetch('mark_1')(function(armor) { 
      armor.data = '...'
      armor.store()()
    }) 

    // PUT /armor/extremis
    var new_armor = bucket.build('extremis', 
      {'content-type': 'application/exoskeleton'})
    new_armor.data = '...'
    new_armor.store()(function(armor) {
      sys.puts(armor.key)
    })

    // POST /mapred
    client.mapReduce()
      // add whole bucket
      .add('armor')
      // add single resource by bucket, key
      .add('armor', 'mark_1')
      .link({'bucket': 'armor'})
      .map(function(v){ return [JSON.parse(v.values[0].data).title]; })
      .reduce(function(values) { return values.sort() }, {'keep': true})
      .run(function(results) {
        ...
      })

## REPL

If you just want to dilly-dally around the Rhodes API, use repl:

    $ node lib/repl.js
    > var c = nori.client()
    > var b = c.bucket('armor')
    > b.prop()(function(props) { sys.puts(sys.inspect(props)) })

## TODO

* Better Error Handling
* Link walking and link map/reduce phases
* MapReduce requests against local data (tests)

## Links

* https://wiki.basho.com/display/RIAK/The+Riak+Fast+Track
* http://bitbucket.org/basho/riak/src/tip/doc/raw-http-howto.txt
* http://github.com/seancribbs/ripple
* http://en.wikipedia.org/wiki/War_Machine