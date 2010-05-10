var rhodes = require('../../lib')
  ,    sys = require('sys')
  ,     fs = require('fs')

rhodes.Client.defaultPort = 8091

if(fs.statSync('goog.csv').isFile()) {
  var client = rhodes.client()
    , bucket = client.bucket('goog')
  fs.readFile('goog.csv', function(err, data) {
    var lines = data.split("\n")
    lines.shift()
    lines.forEach(function(l) {
      var res = bucket.build()
        ,   p = l.split(',') 
      res.data = 
      {Date:p[0],Open:p[1],High:p[2],Low:p[3],Close:p[4],Volume:p[5],'Adj Close':p[6]}
      res.key = res.data.Date
      res.store()(function(r) {
        sys.puts("Inserted " + r.key)
      })
    })
  })
} else {
  sys.puts("Download goog.csv from the Riak Fast Track tutorial:")
  sys.puts("https://wiki.basho.com/display/RIAK/Loading+Data+and+Running+MapReduce+Queries")
}