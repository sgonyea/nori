# Rhodes

Riak HTTP Client for Node.js, inspired by Ripple.

Since most of the functions make HTTP client calls, they return anonymous
functions that take a single callback argument.

Implemented API:

    var Rhodes = require('rhodes')
      , client = new Rhodes.client()
      , bucket = client.bucket('iron_mans')

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

    // GET /iron_mans/mark_1
    bucket.fetch('mark_1')(function(armor) { 
      armor.data = '...'
      armor.store()()
    }) 

    // PUT /iron_mans/extremis
    var new_armor = bucket.build('extremis', 
      {'content-type': 'application/exoskeleton'})
    new_armor.data = '...'
    new_armor.store()(function(armor) {
      sys.puts(armor.key)
    })

    // POST /mapred
    client.mapReduce()
      // add whole bucket
      .add('iron_mans')
      // add single resource by bucket, key
      .add('iron_mans', 'mark_1')
      .link({'bucket': 'iron_mans'})
      .map(function(v){ return [JSON.parse(v.values[0].data).title]; })
      .reduce(function(values) { return values.sort() }, {'keep': true})
      .run(function(results) {
        ...
      })

## TODO

* Better Error Handling
* Link walking and link map/reduce phases
* MapReduce requests against local data (tests)

## Links

* https://wiki.basho.com/display/RIAK/The+Riak+Fast+Track
* http://bitbucket.org/basho/riak/src/tip/doc/raw-http-howto.txt
* http://github.com/seancribbs/ripple
* http://en.wikipedia.org/wiki/War_Machine