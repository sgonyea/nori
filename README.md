# Rhodes

Riak HTTP Client for Node.js, inspired by Ripple.

Envisioned API:

    var Rhodes = require('path/to/rhodes')
    var client = new Rhodes.client()

    var bucket = client.bucket('iron_mans')
    var armor  = bucket.get('mark_1') // GET /iron_mans/mark_1

    var new_armor = bucket.new('extremis', {'content-type': 'application/exoskeleton'})
    new_armor.data = '...'
    new_armor.store() // PUT /iron_mans/extremis

    var results = client.mapReduce()
      .add('artists', 'Beatles')
      .link({'bucket': 'albums'})
      .map(function(v){ return [JSON.parse(v.values[0].data).title]; }, {'keep': true}).run()

## Links

* https://wiki.basho.com/display/RIAK/The+Riak+Fast+Track
* http://bitbucket.org/basho/riak/src/tip/doc/raw-http-howto.txt
* http://github.com/seancribbs/ripple
* http://en.wikipedia.org/wiki/War_Machine