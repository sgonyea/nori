var scope = require('repl').start('>').scope
    scope.rhodes = require('./')
    scope.sys    = require('sys')
    scope.url    = require('url')
    scope.http   = require('http')