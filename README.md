# Rhodes

Riak HTTP Client for Node.js, inspired by Ripple.

Envisioned API:

    var Rhodes = require('path/to/rhodes')
    var client = new Rhodes.client()

    var bucket = client.bucket('iron_mans')

    // get a property
    bucket.prop('name')(function(props) {
      sys.puts(props.name)
    })

    // set a property
    bucket.prop('n_val', '2')()

    // set multiple properties
    bucket.prop(n_val: 2, allow_mult: true)()

    bucket.get('mark_1')(function(armor) { // GET /iron_mans/mark_1
      armor.data = '...'
      armor.store()
    }) 

    var new_armor = bucket.new('extremis', {'content-type': 'application/exoskeleton'})
    new_armor.data = '...'
    new_armor.store()(function(blah) { // PUT /iron_mans/extremis
      
    })

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