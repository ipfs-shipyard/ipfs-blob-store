var ipfs = require('ipfs-api')
var block = require('./lib/block')
var dag = require('./lib/dag')

module.exports = function (opts) {
  if (!opts) opts = {}

  opts.host = opts.host || '127.0.0.1'
  opts.port = opts.port || 5001

  var node = ipfs(opts.host, opts.port)

  return {
    block: block(node),
    dag: dag(node)
  }
}
