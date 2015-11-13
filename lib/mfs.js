var stream = require('stream')

module.exports = function (node) {
  var store = {}
  var baseDir = '/npm-registry/'
  store.baseDir = baseDir
  store.node = node

  node.files.mkdir(baseDir, { p: true }, function (err) {
    if (err) {
      console.error(err)
    }
  })

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
      if (opts.key.indexOf('/')) {
        var dirPath = opts.key.split('/')
        dirPath.pop()
        dirPath = dirPath.join('/')
        node.files.mkdir(baseDir + dirPath, { p: true }, function (err) {
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
        node.files.write(baseDir + opts.key, buffer, { e: true }, function (err) {
          if (err) {
            return cb(err)
          }

          node.files.stat(baseDir + opts.key, function (err, res) {
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

    node.files.read(baseDir + opts.key, {}, function (err, stream) {
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

    node.files.stat(baseDir + opts.key, {}, function (err, res) {
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

    node.files.rm(baseDir + opts.key, {}, function (err) {
      if (err) {
        console.log(err)
        return cb(err)
      }

      cb()
    })
  }

  return store
}

function noop () {}
