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

Envisioned Map/Reduce API:

    var Rhodes = require('path/to/rhodes')
    var client = new Rhodes.client()

    client.mapReduce()
      .add('artists', 'Beatles')
      .link({'bucket': 'albums'})
      .map(function(v){ return [JSON.parse(v.values[0].data).title]; }, {'keep': true})
      .run(function(results) {
        ...
      })

## Links

* https://wiki.basho.com/display/RIAK/The+Riak+Fast+Track
* http://bitbucket.org/basho/riak/src/tip/doc/raw-http-howto.txt
* http://github.com/seancribbs/ripple
* http://en.wikipedia.org/wiki/War_Machine