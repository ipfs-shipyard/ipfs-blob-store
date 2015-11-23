var ipfs = require('ipfs-api')
var mfs = require('./mfs')

module.exports = function (opts) {
  if (!opts) opts = {}

  opts.host = opts.host || '127.0.0.1'
  opts.port = opts.port || 5001

  var node = ipfs(opts.host, opts.port)

  return mfs(node)
}
