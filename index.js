var ipfs = require('ipfs-api')
var stream = require('stream')
var multihash = require('multihashes')
var base58 = require('base58-native')

module.exports = function (opts) {
  if (!opts) opts = {}

  opts.host = opts.host || '127.0.0.1'
  opts.port = opts.port || 5001

  var store = {}

  var node = ipfs(opts.host, opts.port)

  store.createWriteStream = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (typeof opts === 'function') return store.createWriteStream(null, opts)

    var bufferStream = new stream.PassThrough()

    node.block.put(bufferStream, function (err, data) {
      if (err) return cb(err)

      cb(null, {
        key: data.Key,
        size: data.Size
      })
    })

    return bufferStream
  }

  store.createReadStream = function (opts) {
    if (typeof opts === 'string') opts = {key: opts}
    var bufferStream = new stream.PassThrough()
    node.block.get(opts.key, function (err, stream) {
      if (err && !stream) return bufferStream.emit('error', 'No stream')
      stream.pipe(bufferStream)
    })

    return bufferStream
  }

  store.exists = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    var buf

    try {
      buf = base58.decode(opts.key)
      void multihash.decode(buf)
    } catch (e) {
      return cb(null, false)
    }

    node.block.get(opts.key, function (err, stream) {
      if (err) return cb(err)
      cb(null, true)
    })
  }

  store.remove = function (opts, cb) {
    cb(null, true)
  }

  return store
}
