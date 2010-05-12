var nori = require('../../lib')
  ,  sys = require('sys')

nori.Client.defaultPort = 8091

var client = nori.client()
  , mapred = client.mapReduce()
  .add('goog')
  .map(function(value) {
    var data = Riak.mapValuesJson(value)[0];
    if(data.High && data.High > 600.00)
      return [value.key];
    else
      return [];
  }, {keep: true})
  .run(function(results) {
    sys.puts("Days where the high was over $600.00: " + results.join(', '))
    sys.puts(' ----- ')
  })

var mapred = client.mapReduce()
  .add('goog')
  .map(function(value) {
    var data = Riak.mapValuesJson(value)[0];
    if(data.Close < data.Open)
      return [value.key];
    else
      return [];
  }, {keep: true})
  .run(function(results) {
    sys.puts("Days where the close is lower than open: " + results.join(', '))
    sys.puts(' ----- ')
  })

var mapred = client.mapReduce()
  .add('goog')
  .map(function(value) {
    var data = Riak.mapValuesJson(value)[0];
    var month = value.key.split('-').slice(0,2).join('-');
    var obj = {};
    obj[month] = data.High - data.Low;
    return [ obj ];
  })
  .reduce(function(values) {
    return [ values.reduce(function(acc, item){
      for(var month in item){
          if(acc[month]) { acc[month] = (acc[month] < item[month]) ? item[month] : acc[month]; }
          else { acc[month] = item[month]; }
      }
      return acc})];
  })
  .run(function(results) {
    sys.puts("Maximum variance per month: " + sys.inspect(results))
    sys.puts(' ----- ')
  })