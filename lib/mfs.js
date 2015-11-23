var stream = require('stream')

module.exports = function (node) {
  var store = {}
  store.baseDir = '/'
  store.node = node

  store.createWriteStream = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    var bufferStream = new stream.PassThrough()
    var buffer

    bufferStream.on('data', function (chunk) {
      if (!buffer) buffer = chunk
      else {
        buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length)
      }
    })

    bufferStream.on('end', function () {
      // nested, must make sure we have all the dirs along the way
      // https://github.com/ipfs/ipfs-blob-store/pull/5#discussion_r44748249
      if (opts.key[0] === '/') {
        opts.key = opts.key.slice(1)
      }
      if (opts.key.indexOf('/') > -1) {
        var dirPath = opts.key.split('/')
        dirPath.pop()
        dirPath = dirPath.join('/')
        node.files.mkdir(store.baseDir + dirPath, { p: true }, function (err) {
          if (err) {
            console.error(err)
            return cb(err)
          }
          writeBuf()
        })
      } else {
        writeBuf()
      }

      function writeBuf () {
        node.files.write(store.baseDir + opts.key, buffer, { e: true }, function (err) {
          if (err) {
            return cb(err)
          }

          node.files.stat(store.baseDir + opts.key, function (err, res) {
            if (err) {
              return cb(err)
            }

            var metadata = {
              key: opts.key, // no need to ref by the res.Hash thanks to mfs
              size: res.Size,
              name: opts.key
            }

            cb(null, metadata)
          })
        })
      }
    })

    return bufferStream
  }

  store.createReadStream = function (opts) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name

    var passThrough = new stream.PassThrough()

    node.files.read(store.baseDir + opts.key, {}, function (err, stream) {
      if (err) {
        return passThrough.emit('error', err)
      }

      stream.pipe(passThrough)
    })

    return passThrough
  }

  store.exists = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    node.files.stat(store.baseDir + opts.key, {}, function (err, res) {
      if (err) {
        if (err.code === 0) {
          return cb(null, false)
        }
        return cb(err)
      }

      cb(null, true)
    })
  }

  store.remove = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    node.files.rm(store.baseDir + opts.key, {}, function (err) {
      if (err) {
        // console.log('error ->', err)
        return cb()
        // TODO files API is responding with 500 (probably cause of bitswap)
        // return cb(err)
      }

      cb()
    })
  }

  return store
}

function noop () {}
