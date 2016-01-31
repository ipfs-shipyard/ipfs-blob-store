var ipfsAPI = require('ipfs-api')
var mfs = require('./mfs')

module.exports = function (options) {
  if (!options) options = {}

  options.host = options.host || '127.0.0.1'
  options.port = options.port || 5001

  var ipfsCtl = ipfsAPI(options.host, options.port)

  options.ipfsCtl = ipfsCtl
  return mfs(options)
}
