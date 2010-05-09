var sys = require('sys')

var Bucket = function(client, name) {
  this.client = client
  this.name   = name
}

Bucket.prototype.prop = function(name) {
  if(!this.props) {
    
  }
}

exports.Bucket = Bucket