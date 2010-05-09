var Client = require('./client').Client

exports.client = function(uri, options) { 
  return new Client(uri, options)
}