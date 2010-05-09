var sys = require('sys')

exports.extend = function extend(a, b) {
  var prop;
  Object.keys(b).forEach(function(prop) {
    a[prop] = b[prop];
  })
  return a;
}