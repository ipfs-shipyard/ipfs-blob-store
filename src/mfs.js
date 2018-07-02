'use strict'

const stream = require('stream')
const path = require('path')

module.exports = function (options) {
  var store = {}
  store.baseDir = options.baseDir || '/'

  if (!store.baseDir.endsWith('/')) {
    store.baseDir += '/'
  }

  var ipfsCtl = options.ipfsCtl
  store.ipfsCtl = ipfsCtl
  if (typeof options.flush === 'boolean' && options.flush === false) {
    // let it as it is
  } else {
    options.flush = true
  }

  store.createWriteStream = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    const writePath = normalisePath(store.baseDir + opts.key)
    const directory = path.dirname(writePath)
    const bufferStream = new stream.PassThrough()
    let buffer = Buffer.alloc(0)

    bufferStream.on('data', function (chunk) {
      buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length)
    })

    bufferStream.on('end', function () {
      // nested, must make sure we have all the dirs along the way
      // https://github.com/ipfs/ipfs-blob-store/pull/5#discussion_r44748249

      if (`${directory}/` !== store.baseDir) {
        ipfsCtl.files.mkdir(directory, { p: true, flush: options.flush }, function (err) {
          if (err) {
            return cb(err)
          }

          writeBuf()
        })
      } else {
        writeBuf()
      }

      function writeBuf () {
        ipfsCtl.files.write(writePath, buffer, { e: true, flush: options.flush }, function (err) {
          if (err) {
            return cb(err)
          }

          const metadata = {
            key: opts.key, // no need to ref by the res.Hash thanks to mfs
            size: buffer.length,
            name: opts.key
          }

          cb(null, metadata)
        })
      }
    })

    return bufferStream
  }

  store.createReadStream = function (opts) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name

    const passThrough = new stream.PassThrough()
    const readPath = normalisePath(store.baseDir + opts.key)

    ipfsCtl.files.read(readPath, {}, (err, stream) => {
      if (err) {
        if (err.toString().indexOf('does not exist') > -1 || err.toString().indexOf('Not a directory') > -1) {
          err.notFound = true
        }

        return passThrough.emit('error', err)
      }

      if (stream.pipe) {
        stream.pipe(passThrough)
      } else {
        passThrough.end(stream)
      }
    })

    return passThrough
  }

  store.exists = function (opts, cb) {
    if (typeof opts === 'string') opts = {key: opts}
    if (opts.name) opts.key = opts.name
    if (!cb) cb = noop

    const statPath = normalisePath(store.baseDir + opts.key)

    ipfsCtl.files.stat(statPath, {}, (err) => {
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

    const rmPath = normalisePath(store.baseDir + opts.key)

    ipfsCtl.files.rm(rmPath, {}, (err) => {
      if (err) {
        return cb(err)
      }

      cb()
    })
  }

  return store
}

function noop () {}

function normalisePath (path) {
  return path.replace(/\/(\/)+/g, '/')
}
